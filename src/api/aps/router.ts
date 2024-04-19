import express from 'express';
import validation from './validation';
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
  description: string;
};

const router = express.Router();

router.post('/create', async (req, res) => {
  const { error: validationError, value: validationValue } =
    validation.validate(req.body);

  if (validationError) {
    res.status(400).send(validationError.message);
    return;
  }

  for (const feature of validationValue.features) {
    try {
      const ap = await prisma.accessPoint.create({
        data: {
          description: feature.properties.description
            ? feature.properties.description
            : '',
          xCoordinate: feature.geometry.coordinates[0],
          yCoordinate: feature.geometry.coordinates[1],
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
      console.log(ap);
    } catch (e) {
      if (
        e instanceof PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        res.status(400).send({
          status: 400,
          message:
            'Attempting to create a network with BSSID that already exists',
        });
        return;
      }

      console.log(e);
      res.status(500).send('An unknown error occurred');
      return;
    }
  }
  res.sendStatus(200);
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
      const apTotal = floor.rooms
        .map((room) => room.accessPoints)
        .flat().length;
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
            description: ap.description,
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
  const type = req.query.type;

  if (id == undefined) {
    res.status(400).send('Invalid ID');
    return;
  }

  try {
      await prisma.floor.findFirstOrThrow({
        where: {
          id: id,
        },
      })
  } catch (e) {
    console.log(e);
    res.status(404).send({
      errors: {
        status: 404,
        message: 'Floor not found',
      },
    });
    return;
  }

  const prismaFindOptions = {
    where: {
      room: {
        floorId: id,
      },
    },
    include: {
      room: {
        include: {
          floor: true,
        },
      },
      networks: true,
    },
  };

  if (type == 'geojson') {
    try {
      const aps =
        await prisma.accessPoint.findMany(prismaFindOptions);

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
                    ssid: network.ssid,
                  };
                }),
                description: ap.description,
              },
              geometry: {
                type: 'Point',
                coordinates: [ap.xCoordinate, ap.yCoordinate],
              },
            };
          }),
        },
      };

      res.send(response);
      return;
    } catch (e) {
      console.log(e);
      res.status(500).send('An unknown error occurred');
      return;
    }
  }

  if (!type || type == 'table') {
    try {
      const networks = await prisma.network.findMany({
        where: {
          ap: {
            room: {
              floorId: id,
            },
          },
        },
        include: {
          ap: {
            include: {
              room: {
                include: {
                  floor: true,
                },
              },
              networks: true,
            },
          },
        },
      });

      const response = {
        floorName: networks[0].ap.room.floor.name,
        bssids: networks.map((network, index) => {
          return {
            key: index + 1,
            apInfo: {
              id: network.ap.id,
              locationName: network.ap.room.name,
              description: network.ap.description,
              bssidTotal: network.ap.networks.length,
            },
            ssid: network.ssid,
            bssid: network.bssid,
          };
        }),
      };

      res.send(response);
      return;
    } catch (e) {
      console.error(e);
      res.status(500).send('An unknown error occurred');
      return;
    }
  }

  res.status(400).send({
    errors: {
      status: 400,
      message: 'Invalid type. Available types: table, geojson',
    },
  });
  return;
});

export default router;
