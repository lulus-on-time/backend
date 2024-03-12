import express from 'express';
import prisma from '../../db/prisma-client';
import validation from './validation';
import { Room } from '@prisma/client';

const router = express.Router();

router.post('/create', async (req, res) => {
  console.log(req.body);
  const { error: validationError, value: validationValue } =
    validation.validate(req.body);

  if (validationError) {
    res.status(400).send(validationError.message);
    return;
  }

  const floor = validationValue.floor;

  const newFloor = await prisma.floor.create({
    data: {
      name: floor.name,
      level: floor.level,
    },
  });

  const features = validationValue.features;
  const response: Room[] = [];

  features.forEach(async (feature) => {
    const roomName = feature.properties.name;
    const roomCentroid = {
      x: feature.properties.centroid[0],
      y: feature.properties.centroid[1],
    };
    const roomCoordinates = feature.geometry.coordinates[0].map(
      (coordinate: number[]) => {
        return { x: coordinate[0], y: coordinate[1] };
      },
    );

    try {
      const result = await prisma.room.create({
        data: {
          name: roomName,
          coordinates: {
            createMany: { data: roomCoordinates },
          },
          centroid: { create: roomCentroid },
          floor: {
            connect: {
              id: newFloor.id,
            },
          },
        },
      });
      response.push(result);
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  });
  res.send(response);
});

router.get('/', async (req, res) => {
  const floorId = req.query.floorId as string;
  console.log('HELLO');
  console.log(floorId);

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
        centroid: true,
        coordinates: {
          orderBy: {
            id: 'asc',
          },
        },
        floor: true,
      },
    });

    const result2 = {
      type: 'Feature Collection',
      features: rooms.map((room) => {
        return {
          type: 'Feature',
          properties: {
            name: room.name,
            centroid: [room.centroid.x, room.centroid.y],
          },
          geometry: {
            type: 'polygon',
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

    res.send(result2);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

export default router;
