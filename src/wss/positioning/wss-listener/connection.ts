import WebSocket from 'ws';
import prisma from '../../../db/prisma-client';
import { io } from 'socket.io-client';
import validation from '../validation';
import { randomUUID } from 'crypto';

const listener = async (
  ws: WebSocket, //request: Request
) => {
  const uuid = randomUUID();
  console.log(`Client connected with id: ${uuid}`)

  const client = io('http://127.0.0.1:5000', { forceNew: true });

  client.on(`predict_${uuid}`, (response: {prediction: {label: string, probability: number}[]}) => {
    console.log(response);
    ws.send(JSON.stringify({ location: response.prediction[0].label}));
  });

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

    const {error: validationError, value: validationValue} = validation.validate(data);

    if (validationError) {
      console.log(validationError.message);
      ws.send(validationError.message);
      return;
    }

    for (const fingerprint of validationValue.data.fingerprints) {
      fingerprint.rssi = Math.pow(10, fingerprint.rssi / 10)
    }

    client.emit('predict', JSON.stringify({clientId: uuid, data: validationValue.data.fingerprints}));

    if (!validationValue.npm) {
      console.log('Unauthenticated user')
      return;
    }

    try {
      const schedule = await prisma.schedule.findFirstOrThrow({
        where: {
          startTime : new Date().toLocaleString("id-ID", {timeZoneName: "shortOffset"}),
          Subject: {
            students: {
              some: {
                npm: validationValue.npm,
              },
            },
              }
            },
          })

      const networks = await prisma.network.findMany({})
      const bssids = networks.map((network) => network.bssid);

      const filteredFingerprints = validationValue.data.fingerprints.filter((fingerprint) => bssids.includes(fingerprint.bssid));

      if (filteredFingerprints.length === 0) {
        console.log('No valid fingerprints')
        return;
      }

      const fingerprints = await prisma.fingerprint.create({
        data: {
          createdAt: new Date().toLocaleString("id-ID", {timeZoneName: "shortOffset"}),
          location: {
            connect: {
              id: schedule.roomId
            }
          },
          fingerprintDetails: {
            createMany: {
              data: filteredFingerprints
            }
          }
        }
      })

      console.log(fingerprints)
      
    } catch (e) {
      console.log("No Schedule Currently Active")
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
