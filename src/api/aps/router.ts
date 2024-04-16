import express from 'express';
import validation from './validation';
import { AccessPoint } from '@prisma/client';
import prisma from '../../db/prisma-client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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

      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        res.status(400).send({status: 400, message: 'Attempting to create a network with BSSID that already exists'});
        return;
      }

      console.log(e);
      res.status(500).send('An unknown error occurred');
      return;
    }
  }
  res.status(200).send(response);
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
      const apTotal = floor.rooms.map((room) => room.accessPoints).flat().length;
      for (const room of floor.rooms) {
        for (const ap of room.accessPoints) {
          apResponse.push({
            key: ap.id,
            floor: {
              id: floor.id,
              name: floor.name,
              level: floor.level,
              apTotal: apTotal,
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

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  if (id == undefined) {
    res.status(400).send('Invalid ID');
    return;
  }

  try {
    const aps = await prisma.accessPoint.findMany({
      where: {
        room: {
          floorId: id
        }
      },
      include: {
        room: {
          include: {
            floor: true
          }
        },
        networks: true,
        coordinate: true
      }
    })

    const response = {
      floor: {
        id: aps[0].room.floor.id,
        name: aps[0].room.floor.name,
      },
      geojson: {
        type: 'FeatureCollection',
        features: aps.map((ap) => {
          return {
            type: 'Feature',
            properties: {
              spaceId: ap.room.id,
              spaceName: ap.room.name,
              bssids: ap.networks.map((network) => {
                return {
                  bssid: network.bssid,
                  ssid: network.ssid
                }
              })
            },
            geometry: {
              type: 'Point',
              coordinates: [ap.coordinate.x, ap.coordinate.y]
            }
          }
        })
      }
    }

    res.send(response);
  } catch (e) {
    console.log(e);
    res.status(500).send('An unknown error occurred');
    return;
  }
})

export default router;
