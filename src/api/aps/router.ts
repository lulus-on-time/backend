import express from 'express';
import validation from './validation';
import { AccessPoint } from '@prisma/client';
import prisma from '../../db/prisma-client';

type ApResponse = {
  key: number;
  floor: {
    id: number;
    name: string;
    level: number;
    apTotal: number;
  };
  locationName: string;
};

const router = express.Router();

router.post('/create', async (req, res) => {
  console.log(req.body.features[0].properties.bssids[0].bssid);
  const { error: validationError, value: validationValue } =
    validation.validate(req.body);

  if (validationError) {
    res.status(400).send(validationError.message);
    return;
  }

  const response: AccessPoint[] = [];

  for (const feature of validationValue.features) {
    try {
      const ap = await prisma.accessPoint.create({
        data: {
          description: 'Test Description',
          coordinate: {
            create: {
              x: feature.geometry.coordinates[0],
              y: feature.geometry.coordinates[1],
            },
          },
          room: {
            connect: {
              id: feature.properties.spaceId,
            },
          },
          networks: {
            createMany: {
              data: feature.properties.bssids.map(
                (networkDetail: { bssid: string; ssid: string }) => {
                  return {
                    bssid: networkDetail.bssid,
                    ssid: networkDetail.ssid,
                  };
                },
              ),
            },
          },
        },
      });
      response.push(ap);
    } catch (e) {
      console.log(e);
      res.status(500).send('An unknown error occurred');
      return;
    }

    res.status(200).send(response);
  }
});

router.get('/', async (req, res) => {
  try {
    const floors = await prisma.floor.findMany({
      orderBy: {
        level: 'asc',
      },
      include: {
        rooms: {
          include: {
            accessPoints: true,
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
    });

    const apResponse: ApResponse[] = [];

    for (const floor of floors) {
      for (const room of floor.rooms) {
        for (const ap of room.accessPoints) {
          apResponse.push({
            key: ap.id,
            floor: {
              id: floor.id,
              name: floor.name,
              level: floor.level,
              apTotal: room.accessPoints.length,
            },
            locationName: room.name,
          });
        }
      }
    }

    res.send(apResponse);
  } catch (e) {
    console.log(e);
    res.status(500).send('An unknown error occurred');
    return;
  }
});

export default router;
