import express from 'express';
import prisma from '../../db/prisma-client';
import validation from './validation';
import { Floor, RoomType } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const router = express.Router();

router.post('/create', async (req, res) => {
  const { error: validationError, value: validationValue } =
    validation.validate(req.body);

  if (validationError) {
    res.status(400).send(validationError.message);
    return;
  }

  const floor = validationValue.floor;
  let newFloor: Floor | null = null;

  try {
    newFloor = await prisma.floor.create({
      data: {
        name: floor.name,
        level: floor.level,
      },
    });
  } catch (e: unknown) {
    console.log(e);

    if (
      e instanceof PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      res.status(400).send({
        error: { status: 400, message: 'Floor level exists' },
      });
    } else {
      res.status(500).send('An unknown error occurred');
    }
  }

  if (newFloor == null) {
    return;
  }

  const features = validationValue.features;

  for (const feature of features) {
    try {
      const room = await prisma.room.create({
        data: {
          name: feature.properties.name,
          poiX: feature.properties.poi[0],
          poiY: feature.properties.poi[1],
          roomType:
            feature.properties.category == 'room'
              ? RoomType.room
              : RoomType.corridor,
          coordinates: {
            createMany: {
              data: feature.geometry.coordinates[0].map(
                (coordinate) => {
                  return { x: coordinate[0], y: coordinate[1] };
                },
              ),
            },
          },
          floor: { connect: { id: newFloor.id } },
        },
      });
      console.log(room);
    } catch (e) {
      console.log(e);
      res.status(500).send('An unknown error occurred');
      return;
    }
  }
  res.sendStatus(200);
});

router.get('/short', async (req, res) => {
  try {
    const floorIds = await prisma.floor.findMany({
      select: {
        id: true,
        level: true,
        name: true,
      },
    });
    res.send(floorIds);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }

  return;
});

router.get('/:id', async (req, res) => {
  const floorId = req.params.id;

  try {
    await prisma.floor.findFirstOrThrow({
      where: {
        id: parseInt(floorId),
      }
    })
  } catch (e) {
    console.log(e);
    res.status(404).send({
      error: {
        status: 404,
        message: 'Floor Id Does Not Exist',
      }
    })
    return;
  }

  try {
    const rooms = await prisma.room.findMany({
      where: {
        floorId: {
          equals: isNaN(parseInt(floorId))
            ? undefined
            : parseInt(floorId),
          not: isNaN(parseInt(floorId)) ? -1 : undefined,
        },
      },
      include: {
        coordinates: {
          orderBy: {
            id: 'asc',
          },
        },
        floor: true,
      },
    });

    let floor: Floor | null = null;

    if (floorId != undefined) {
      floor = await prisma.floor.findUnique({
        where: {
          id: parseInt(floorId),
        },
      });
    }

    const response = {
      type: 'FeatureCollection',
      features: rooms.map((room) => {
        return {
          type: 'Feature',
          properties: {
            name: room.name,
            poi: [room.poiX, room.poiY],
            category: room.roomType.toString(),
            id: room.id,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              room.coordinates.map((coordinate) => [
                coordinate.x,
                coordinate.y,
              ]),
            ],
          },
        };
      }),
    };

    if (floor != null) {
      const coordinates = [
        ...rooms.map((room) => room.coordinates).flat(),
      ];

      const maxX = Math.max(
        ...coordinates.map((coordinate) => coordinate.x),
      );
      const maxY = Math.max(
        ...coordinates.map((coordinate) => coordinate.y),
      );

      res.send({
        floor: {
          name: floor.name,
          id: floor.id,
          level: floor.level,
          maxX: maxX,
          maxY: maxY,
        },
        geojson: response,
      });
      return;
    }

    res.send({ geojson: response });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

router.delete('/:id', async (req, res) => {
  const floorId = req.params.id;

  try {
    await prisma.floor.delete({
      where: {
        id: parseInt(floorId),
      },
    });
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(404).send({
      error: {
        status: 404,
        message: "Floor Id Does Not Exist"
      }
    })
  }
})

export default router;
