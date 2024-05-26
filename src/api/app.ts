import express, { Response } from 'express';
import dotenv from 'dotenv';
import roomRouter from './floor/router';
import cors from 'cors';
import apRouter from './aps/router';
import subjectRouter from './subjects/router';
import prisma from '../db/prisma-client';
import WebSocket from 'ws';
import fs from 'fs';
import pointinPolygon from 'point-in-polygon';
dotenv.config();
const app = express();
const port = process.env.APIPORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.listen(port, () => {
  console.log('Express app running on port ' + port);
});

app.use('/floors', roomRouter);
app.use('/aps', apRouter);
app.use('/subjects', subjectRouter);

app.get('/', async (req, res) => {
  doTesting(res);
  // getFingerprintsForTesting(res);
});

let counter = 1;

const getFingerprintsForTesting = async (res: Response) => {
  const fingerprints = await prisma.fingerprint.findMany({
    select: {
      id: true,
      locationId: true,
      fingerprintDetails: {
        select: {
          bssid: true,
          rssi: true,
        },
      },
      location: {
        select: {
          name: true,
          schedules: {
            select: {
              Subject: {
                select: {
                  students: true,
                },
              },
            },
          },
          roomType: true,
        },
      },
    },
    orderBy: {
      locationId: 'asc',
    },
  });

  const response = fingerprints.map((fingerprint) => {
    if (
      fingerprint.location.schedules
        ?.at(0)
        ?.Subject?.students?.at(0) === null ||
      fingerprint.location.schedules
        ?.at(0)
        ?.Subject?.students?.at(0) === undefined
    ) {
      res.sendStatus(500);
      throw new Error(
        `Subject not found for room with name ${fingerprint.location.name}`,
      );
    }
    return {
      reason: 'fingerprint',
      data: {
        fingerprints: fingerprint.fingerprintDetails.map((fpD) => {
          return {
            bssid: fpD.bssid,
            rssi: Math.round(Math.log10(fpD.rssi) * 10),
          };
        }),
      },
      npm:
        fingerprint.location.roomType == 'corridor'
          ? undefined
          : fingerprint.location.schedules[0].Subject.students[0].npm,
    };
  });

  const arrayOfLabels = fingerprints.map((fp) => fp.locationId);

  res.send(
    JSON.stringify({
      fingerprintRequests: response,
      arrayOfLabels: arrayOfLabels,
    }),
  );
};

const doTesting = async (res: Response) => {
  const json = JSON.parse(
    fs.readFileSync('testRequest.json', 'utf8'),
  );

  const fingerprintRequests: {
    reason: string;
    data: { fingerprints: { rssi: number; bssid: string }[] };
    npm: string | undefined;
  }[] = json.fingerprintRequests;

  const arrayOfLabels: number[] = json.arrayOfLabels;

  const labelSet = new Set(arrayOfLabels);

  const totalResponse: { y_pred: number[]; y_true: number[] }[] = [];
  const promises: Promise<any>[] = [];

  for (const distinctLabel of labelSet) {
    const x_test = fingerprintRequests.filter(
      (fingerprintRequest, index) => {
        return arrayOfLabels[index] === distinctLabel;
      },
    );
    console.log(x_test.length);
    promises.push(
      getYPred(x_test).then((y_pred) => {
        totalResponse.push({
          y_pred: y_pred,
          y_true: arrayOfLabels.filter(
            (label) => label === distinctLabel,
          ),
        });
      }),
    );
  }

  await Promise.all(promises);

  res.send(JSON.stringify(totalResponse));
};

const getYPred = async (
  fingerprints: {
    reason: string;
    data: { fingerprints: { rssi: number; bssid: string }[] };
    npm: string | undefined;
  }[],
): Promise<number[]> => {
  const rooms = await prisma.room.findMany({
    include: {
      coordinates: true,
    },
  });
  const ws = new WebSocket('ws://localhost:8080');
  const y_pred: { floorId: number; x: number; y: number }[] = [];
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data.toString()).data;
    y_pred.push({
      floorId: data.floorId,
      x: data.location[1],
      y: data.location[0],
    });
    console.log('Received data from wss: ', counter);
    counter++;
  };
  ws.onopen = async () => {
    await sendWssData(ws, fingerprints);
  };

  while (y_pred.length !== fingerprints.length) {
    await delay(1000);
  }
  const trueY_pred = y_pred.map((pred) => {
    const room = rooms
      .filter((room) => room.floorId === pred.floorId)
      .filter((room) =>
        pointinPolygon(
          [pred.x, pred.y],
          room.coordinates.map((coord) => [coord.x, coord.y]),
        ),
      )
      .at(0);

    return room === undefined ? -1 : room.id;
  });
  return Promise.resolve(trueY_pred);
};

const sendWssData = async (
  ws: WebSocket,
  x_test: {
    reason: string;
    data: {
      fingerprints: {
        bssid: string;
        rssi: number;
      }[];
    };
    npm: string | undefined;
  }[],
) => {
  for (const x of x_test) {
    ws.send(JSON.stringify(x));
    await delay(1000);
  }
};

const delay = (ms: number) =>
  new Promise((res) => setTimeout(res, ms));
