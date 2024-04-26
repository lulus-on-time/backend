import express, { Request, Response } from 'express';
import validation from './validation';
import prisma from '../../db/prisma-client';
import {
  DefaultArgs,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime/library';
import {
  AccessPoint,
  Floor,
  Network,
  Prisma,
  PrismaClient,
  Room,
} from '@prisma/client';

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

  let floor: Floor;
  try {
    floor = await prisma.floor.findFirstOrThrow({
      where: {
        id: id,
      },
    });
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
    let aps: (AccessPoint & { room: Room & { floor: Floor } } & {
      networks: Network[];
    })[] = [];
    try {
      aps = aps.concat(
        await prisma.accessPoint.findMany(prismaFindOptions),
      );
    } catch (e) {
      console.error(e);
      res.status(500).send({
        errors: {
          status: 500,
          message: 'Error retrieving access points',
        },
      });
      return;
    }

    const response = {
      floor: {
        id: floor.id,
        name: floor.name,
      },
      geojson: {
        type: 'FeatureCollection',
        features: [] as {
          type: string;
          properties: {
            spaceId: number;
            spaceName: string;
            bssids: {
              bssid: string;
              ssid: string;
            }[];
            description: string;
            id: number;
          };
          geometry: {
            type: string;
            coordinates: number[];
          };
        }[],
      },
    };

    for (const ap of aps) {
      const feature = {
        type: 'Feature',
        properties: {
          spaceId: ap.room.id,
          spaceName: ap.room.name,
          bssids: [] as { bssid: string; ssid: string }[],
          description: ap.description,
          id: ap.id,
        },
        geometry: {
          type: 'Point',
          coordinates: [ap.xCoordinate, ap.yCoordinate],
        },
      };

      for (const network of ap.networks) {
        feature.properties.bssids.push({
          bssid: network.bssid,
          ssid: network.ssid,
        });
      }

      response.geojson.features.push(feature);
    }
    res.send(response);
    return;
  }

  if (!type || type == 'table') {
    let aps: (AccessPoint & { room: Room & { floor: Floor } } & {
      networks: Network[];
    })[] = [];

    try {
      aps = aps.concat(
        await prisma.accessPoint.findMany(prismaFindOptions),
      );
    } catch (e) {
      console.error(e);
      res.status(500).send({
        errors: {
          status: 500,
          message: 'Error retrieving access points',
        },
      });
      return;
    }

    const bssids: {
      key: number;
      apInfo: {
        id: number;
        locationName: string;
        description?: string;
        bssidTotal: number;
      };
      ssid: string;
      bssid: string;
    }[] = [];

    let key = 1;
    for (const ap of aps) {
      for (const network of ap.networks) {
        bssids.push({
          key: key,
          apInfo: {
            id: ap.id,
            locationName: ap.room.name,
            description: ap.description,
            bssidTotal: ap.networks.length,
          },
          ssid: network.ssid,
          bssid: network.bssid,
        });
        key++;
      }
    }

    const response = {
      floorName: floor.name,
      bssids: bssids,
    };

    res.send(response);
    return;
  }
});

async function handleRequestInTransaction(
  req: Request,
  res: Response,
  prisma: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    | '$connect'
    | '$disconnect'
    | '$on'
    | '$transaction'
    | '$use'
    | '$extends'
  >,
) {
  const { error: validationError, value: validationValue } =
    validation.validate(req.body);

  if (validationError) {
    throw Error(validationError.message);
  }

  const id = req.params.id;

  let floor: Floor & {
    rooms: (Room & {
      accessPoints: (AccessPoint & { networks: Network[] })[];
    })[];
  };

  try {
    floor = await prisma.floor.findFirstOrThrow({
      where: {
        id: parseInt(id),
      },
      include: {
        rooms: {
          include: {
            accessPoints: {
              include: {
                networks: true,
              },
            },
          },
        },
      },
    });
  } catch (e) {
    console.error(e);
    throw Error('Error retrieving floor');
    return;
  }

  // delete
  const networksInDb = floor.rooms.flatMap(room => room.accessPoints).flatMap(ap => ap.networks).map(network => network.bssid);
  const networksInRequest = validationValue.features.flatMap(feature => feature.properties.bssids).map(network => network.bssid);
  const networksToDelete = networksInDb.filter(network => !networksInRequest.includes(network));

  if (networksToDelete.length > 0) {
    try {
      await prisma.network.deleteMany({
        where: {
          bssid: {
            in: networksToDelete,
          },
        },
      });
    } catch (e) {
      console.error(e);
      throw Error('Error deleting Networks');
    }
  }

  const apsInDb = floor.rooms.flatMap((room) => room.accessPoints);
  const apsInRequest = validationValue.features;
  const idsInRequest = apsInRequest
    .filter((ap) => ap.properties.id != undefined)
    .map((ap) => ap.properties.id as number);

  const apsToDelete = apsInDb.filter(
    (ap) => !idsInRequest.includes(ap.id),
  );
  const idsToDelete = apsToDelete.map((ap) => ap.id);

  if (idsToDelete.length > 0) {
    try {
      await prisma.accessPoint.deleteMany({
        where: {
          id: {
            in: idsToDelete,
          },
        },
      });
    } catch (e) {
      console.error(e);
      throw Error('Error deleting access points');
    }
  }

  const setOfAps: Set<number> = new Set();
  const setOfBssids: Set<string> = new Set();

  for (const feature of apsInRequest) {
    let accessPoint: AccessPoint;

    if (feature.properties.id == undefined) {
      // create
      try {
        accessPoint = await prisma.accessPoint.create({
          data: {
            description:
              feature.properties.description == undefined
                ? '-'
                : feature.properties.description,
            xCoordinate: feature.geometry.coordinates[0],
            yCoordinate: feature.geometry.coordinates[1],
            room: {
              connect: {
                id: feature.properties.spaceId,
              },
            },
          },
        });

        setOfAps.add(accessPoint.id);
      } catch (e) {
        console.error(e);
        throw Error('Error creating access points');
      }
    } else {
      // update
      if (setOfAps.has(feature.properties.id)) {
        throw Error('Duplicate AP Id Found');
      }

      setOfAps.add(feature.properties.id);

      try {
        accessPoint = await prisma.accessPoint.update({
          where: {
            id: feature.properties.id,
          },
          data: {
            description:
              feature.properties.description == undefined
                ? '-'
                : feature.properties.description,
            xCoordinate: feature.geometry.coordinates[0],
            yCoordinate: feature.geometry.coordinates[1],
            room: {
              connect: {
                id: feature.properties.spaceId,
              },
            },
          },
        });
      } catch (e) {
        console.error(e);
        throw Error('Error updating access points');
      }
    }

    const networkInRequests = feature.properties.bssids;

    for (const networkInRequest of networkInRequests) {
      if (setOfBssids.has(networkInRequest.bssid)) {
        throw Error('Duplicate BSSID Found');
      }

      setOfBssids.add(networkInRequest.bssid);

      await prisma.network.upsert({
        where: {
          bssid: networkInRequest.bssid,
        },
        update: {
          ssid: networkInRequest.ssid,
          ap: {
            connect: {
              id: accessPoint.id,
            },
          },
        },
        create: {
          bssid: networkInRequest.bssid,
          ssid: networkInRequest.ssid,
          ap: {
            connect: {
              id: accessPoint.id,
            },
          },
        },
      });
    }
  }
}

router.post('/:id/edit', async (req, res) => {
  try {
    await prisma.$transaction(async (prisma) => {
      await handleRequestInTransaction(req, res, prisma);
    });
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      res.status(500).send({
        errors: {
          status: 500,
          message: e.message,
        },
      });
      return;
    }

    res.status(500).send({
      errors: {
        status: 500,
        message: 'An unknown error occurred',
      },
    });
  }
});

export default router;
