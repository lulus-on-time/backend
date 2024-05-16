import WebSocket from 'ws';
import prisma from '../../../db/prisma-client';
import validation from '../validation';
import { randomUUID } from 'crypto';
import socketIoClient from '../socketio-client/client';
import computeTrilateration from '../trilateration/computeTrilateration';
import { threshold } from '../constants';

const listener = async (
  ws: WebSocket, //request: Request
) => {
  const uuid = randomUUID();
  console.log(`Client connected with id: ${uuid}`);

  const client = socketIoClient;

  let trilaterationCoordinate: {
    data: {
      location: [number, number];
      poi: string;
      floorId: number;
    };
  } = {
    data: {
      location: [0, 0],
      poi: 'null',
      floorId: -2,
    },
  };

  client.on(
    `predict_${uuid}`,
    async (
      response: { locationId: string; probability: number }[],
    ) => {
      if (response[0].probability < threshold) {
        ws.send(JSON.stringify(trilaterationCoordinate));
      }
      console.log(response);

      try {
        const room = await prisma.room.findFirstOrThrow({
          where: {
            id: parseInt(response[0].locationId),
          },
        });
        ws.send(
          JSON.stringify({
            data: {
              location: [room.poiX, room.poiY],
              poi: room.name,
              floorId: room.floorId,
            },
          }),
        );
      } catch (e) {
        console.error(e);
        console.log('error getting room info');
      }
    },
  );

  ws.on('message', async (data, isBinary) => {
    if (isBinary) {
      ws.send(
        JSON.stringify({
          errors: {
            reason: 'Not accepting binary data.',
          },
          data: null,
        }),
      );
      return;
    }

    let dataAsJson: unknown;

    try {
      dataAsJson = JSON.parse(data.toString());
    } catch (e) {
      console.log(e);
      ws.send(
        JSON.stringify({
          errors: { reason: 'Invalid JSON Data' },
          data: null,
        }),
      );
      return;
    }

    const { error: validationError, value: validationValue } =
      validation.validate(dataAsJson);

    if (validationError) {
      console.log(validationError.message);
      ws.send(validationError.message);
      return;
    }

    for (const fingerprint of validationValue.data.fingerprints) {
      fingerprint.rssi = Math.pow(10, fingerprint.rssi / 10);
    }

    client.emit('predict', {
      clientId: uuid,
      data: validationValue.data.fingerprints,
    });

    console.log(
      JSON.stringify({
        clientId: uuid,
        data: validationValue.data.fingerprints,
      }),
    );

    trilaterationCoordinate = await computeTrilateration(
      validationValue.data.fingerprints,
    );

    if (!validationValue.npm) {
      console.log('Unauthenticated user');
      return;
    }

    try {
      const now = new Date();
      const schedule = await prisma.schedule.findFirstOrThrow({
        where: {
          startTime: {
            lte: now,
          },
          endTime: {
            gte: now,
          },
          Subject: {
            students: {
              some: {
                npm: validationValue.npm,
              },
            },
          },
        },
      });

      const networks = await prisma.network.findMany({});
      const bssids = networks.map((network) => network.bssid);

      const filteredFingerprints =
        validationValue.data.fingerprints.filter((fingerprint) =>
          bssids.includes(fingerprint.bssid),
        );

      if (filteredFingerprints.length === 0) {
        console.log('No valid fingerprints');
        return;
      }

      const fingerprints = await prisma.fingerprint.create({
        data: {
          createdAt: new Date(),
          location: {
            connect: {
              id: schedule.roomId,
            },
          },
          fingerprintDetails: {
            createMany: {
              data: filteredFingerprints,
            },
          },
        },
      });

      console.log(fingerprints);
    } catch (e) {
      console.log(e);
      return;
    }
  });

  ws.on('close', (code, reason) => {
    console.log({
      code: `${code}`,
      reason: `${reason}`,
    });
    client.close();
  });

  ws.on('error', (err) => {
    console.error({
      err,
    });
    client.close();
  });
};

export default listener;
