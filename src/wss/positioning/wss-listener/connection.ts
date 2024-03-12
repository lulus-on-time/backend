import WebSocket from 'ws';
import prisma from '../../../db/prisma-client';
import { AccessPoint } from '@prisma/client';

type FingerprintData = {
  bssid: string;
  rssi: number;
};

const listener = async (
  ws: WebSocket, //request: Request
) => {
  console.log('New WebSocket Connection Started');

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

    let bssids: string[] = [];

    try {
      const aps: AccessPoint[] = await prisma.accessPoint.findMany();
      bssids = aps.map((ap: AccessPoint) => ap.bssid);
    } catch (e) {
      console.error(e);
    }

    let dataAsJson;

    try {
      dataAsJson = JSON.parse(data.toString());
    } catch (e) {
      ws.send(
        JSON.stringify({
          errors: {
            reason: 'Only Accepting JSON',
          },
          data: null,
        }),
      );
      return;
    }

    if (dataAsJson['reason'] != 'fingerprint') {
      ws.send(
        JSON.stringify({
          errors: {
            reason: 'Only accepting fingerprint data',
          },
          data: null,
        }),
      );
      return;
    }

    let location: string;
    let fingerprints: FingerprintData[];

    try {
      location = dataAsJson['data']['location'];
      fingerprints = dataAsJson['data']['fingerprints'];
    } catch (e) {
      ws.send(
        JSON.stringify({
          errors: {
            reason: 'No Fingerprint Data Found',
          },
          data: null,
        }),
      );
      return;
    }

    if (fingerprints === undefined || location === undefined) {
      ws.send(
        JSON.stringify({
          errors: {
            reason: 'No Fingerprint Data Found',
          },
          data: null,
        }),
      );
      return;
    }

    console.log(fingerprints);

    const acceptedFingerprints = fingerprints.filter((fingerprint) =>
      bssids.includes(fingerprint.bssid),
    );

    let newFingerprintInDb: {
      fingerprintDetails: {
        id: number;
        fingerprintId: number;
        bssid: string;
        rssi: number;
      }[];
    } & {
      id: number;
      createdAt: Date;
      location: string;
    };

    try {
      newFingerprintInDb = await prisma.fingerprint.create({
        data: {
          location: location,
          fingerprintDetails: {
            createMany: {
              data: acceptedFingerprints,
            },
          },
        },
        include: {
          fingerprintDetails: true,
        },
      });
    } catch (e) {
      console.error(e);
      ws.send(
        JSON.stringify({
          errors: {
            reason: 'Error creating new fingerprint record',
          },
          data: null,
        }),
      );
      return;
    }

    ws.send(
      JSON.stringify({
        errors: null,
        data: {
          location: `New fingerprint entry created with id ${newFingerprintInDb.id}`,
          capturedAPs: newFingerprintInDb.fingerprintDetails.length,
        },
      }),
    );
    console.log(
      `New fingerprint entry created with id ${newFingerprintInDb.id}`,
    );
  });

  ws.on('close', (code, reason) => {
    console.log({
      code: `${code}`,
      reason: `${reason}`,
    });
  });

  ws.on('error', (err) => {
    console.error({
      err,
    });
  });
};

export default listener;
