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
      },
    });
  } catch (e) {
    console.log(e);
    res.status(404).send({
      error: {
        status: 404,
        message: 'Floor Id Does Not Exist',
      },
    });
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
        message: 'Floor Id Does Not Exist',
      },
    });
  }
});

router.post(':id/edits', async (req, res) => {
  const { error: validationError, value: validationValue } =
    validation.validate(req.body);

  if (validationError) {
    res.status(400).send({
      errors: { status: 400, message: validationError.message },
    });
    return;
  }

  const idInRequest = req.params.id;

  try {
    const id = parseInt(idInRequest);

    if (isNaN(id)) {
      throw TypeError('id should be integer.');
    }
    const floor = await prisma.floor.findFirstOrThrow({
      where: {
        id: id,
      },
      include: {
        rooms: {
          include: {
            coordinates: true,
          },
        },
      },
    });

    const floorRequest = validationValue.floor;

    if (
      floorRequest.level != floor.level ||
      floorRequest.name != floor.name
    ) {
      try {
        await prisma.floor.update({
          where: {
            id: id,
          },
          data: {
            name: floorRequest.name,
            level: floorRequest.level,
          },
        });
      } catch (e) {
        console.log(e);
        res.status(500).send({
          status: 500,
          message: 'Error updating floor information',
        });
        return;
      }
    }

    const features = validationValue.features;
    const roomsWithId = features
      .filter((feature) => feature.properties.id != undefined)
      .map((feature) => feature.properties.id);

    if (roomsWithId.length != 0) {
      try {
        await prisma.room.deleteMany({
          where: {
            id: {
              notIn: roomsWithId as number[],
            },
          },
        });
      } catch (e) {
        console.log(e);
        res
          .status(500)
          .send({ status: 500, message: 'Error deleting rooms' });
        return;
      }
    }

    for (const room of features) {
      if (room.properties.id == undefined) {
        try {
          await prisma.room.create({
            data: {
              name: room.properties.name,
              poiX: room.properties.poi[0],
              poiY: room.properties.poi[1],
              roomType:
                room.properties.category == 'room'
                  ? RoomType.room
                  : RoomType.corridor,
              coordinates: {
                createMany: {
                  data: room.geometry.coordinates[0].map(
                    (coordinate) => {
                      return { x: coordinate[0], y: coordinate[1] };
                    },
                  ),
                },
              },
              floor: {
                connect: {
                  id: floor.id,
                },
              },
            },
          });
        } catch (e) {
          res.status(500).send({
            status: 500,
            message: `Error creating room with name ${room.properties.name}`,
          });
          console.log(e);
          return;
        }
      } else {
        const roomInDb = floor.rooms.find(
          (room1) => room1.id == room.properties.id,
        );

        if (roomInDb == undefined) continue;

        if (
          roomInDb.name == room.properties.name &&
          roomInDb.poiX == room.properties.poi[0] &&
          roomInDb.poiY == room.properties.poi[1] &&
          roomInDb.roomType ==
            (room.properties.category == 'room'
              ? RoomType.room
              : RoomType.corridor)
        ) {
          continue;
        }

        try {
          await prisma.room.update({
            data: {
              name: room.properties.name,
              poiX: room.properties.poi[0],
              poiY: room.properties.poi[1],
              roomType:
                room.properties.category == 'room'
                  ? RoomType.room
                  : RoomType.corridor,
            },
            where: {
              id: room.properties.id,
            },
          });
        } catch (e) {
          res.status(500).send({
            status: 500,
            message: `Error creating room with name ${room.properties.name} and id ${room.properties.id}`,
          });
          console.log(e);
          return;
        }
      }
    }

    res.sendStatus(200);
  } catch (e) {
    if (e instanceof TypeError) {
      res
        .status(400)
        .send({ status: 400, message: 'Invalid format for floorId' });
    } else {
      console.log(e);
      res
        .status(500)
        .send({ status: 500, message: 'Error getting floor' });
    }
    return;
  }
});

export default router;
