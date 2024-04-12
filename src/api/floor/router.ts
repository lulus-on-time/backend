import express from 'express';
import prisma from '../../db/prisma-client';
import validation from './validation';
import { Room, Corridor, Floor } from '@prisma/client';
import { FloorRequest } from './type';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

type RoomData = {
  name: string;
  coordinates: { x: number; y: number }[];
  poiX: number;
  poiY: number;
};

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
  const response: (Room | Corridor)[] = [];

  for (const feature of features) {
    const entity = feature.properties.category;

    if (entity == 'room') {
      const roomData = extractRoomData(feature);
      const room = await prisma.room.create({
        data: {
          name: roomData.name,
          poiX: roomData.poiX,
          poiY: roomData.poiY,
          coordinates: {
            createMany: { data: roomData.coordinates },
          },
          floor: { connect: { id: newFloor.id } },
        },
      });
      response.push(room);
    } else {
      const corridorData = extractRoomData(feature);
      const corridor = await prisma.corridor.create({
        data: {
          name: corridorData.name,
          poiX: corridorData.poiX,
          poiY: corridorData.poiY,
          coordinates: {
            createMany: { data: corridorData.coordinates },
          },
          floor: { connect: { id: newFloor.id } },
        },
      });
      response.push(corridor);
    }
  }
  res.send(response);
});

router.get('/', async (req, res) => {
  const floorId = req.query.floorId as string;

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
    const corridors = await prisma.corridor.findMany({
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
      features: rooms
        .map((room) => {
          return {
            type: 'Feature',
            properties: {
              name: room.name,
              poi: [room.poiX, room.poiY],
              category: 'room',
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
        })
        .concat(
          corridors.map((corridor) => {
            return {
              type: 'Feature',
              properties: {
                name: corridor.name,
                poi: [corridor.poiX, corridor.poiY],
                category: 'corridor',
                id: corridor.id,
              },
              geometry: {
                type: 'Polygon',
                coordinates: [
                  corridor.coordinates.map((coordinate) => [
                    coordinate.x,
                    coordinate.y,
                  ]),
                ],
              },
            };
          }),
        ),
    };

    if (floor != null) {
      const coordinates = [
        ...rooms.map((room) => room.coordinates).flat(),
        ...corridors.map((corridor) => corridor.coordinates).flat(),
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

function extractRoomData(
  feature: FloorRequest['features'][number],
): RoomData {
  const roomName = feature.properties.name;
  const roomCoordinates = feature.geometry.coordinates[0].map(
    (coordinate: number[]) => {
      return { x: coordinate[0], y: coordinate[1] };
    },
  );

  const result: RoomData = {
    name: roomName,
    coordinates: roomCoordinates,
    poiX: feature.properties.poi[0],
    poiY: feature.properties.poi[1],
  };

  return result;
}

export default router;
