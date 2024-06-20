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
import { number } from 'joi';
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
  // doTesting(res);
  // getFingerprintsForTesting(res);
  // analyzeTestRequest();
  // analyzeTestResponse()
  // doLoadTesting(res, 30, true);
  doLatencyTesting(res);
});

type TestRequest = {
  fingerprintRequests: {
    reason: string;
    data: { fingerprints: { rssi: number; bssid: string }[] };
    npm: string | undefined;
  }[];
  arrayOfLabels: number[];
};

type TestResponse = {
  y_pred: {
    location: { floorId: number; x: number; y: number };
    roomId: number;
  }[];
  y_true: number[];
}[];

async function doLatencyTesting(res: Response) {
  const json: TestRequest = JSON.parse(
    fs.readFileSync('testRequest.json', 'utf8'),
  );

  const fingerprintRequests = json.fingerprintRequests;

  const ws = new WebSocket('ws://35.219.65.61');

  while (ws.readyState !== ws.OPEN) {
    await delay(1000);
  }

  ws.onmessage = () => {
    tRes.push(Date.now());
  };

  const tRes: number[] = [];
  const tReq = await sendWssDataWithTimeStamp(
    ws,
    fingerprintRequests.slice(0, 600),
  );

  if (tReq.length !== tRes.length) {
    console.log('Length mismatch');
    res.send({ tReq: tReq, tRes: tRes });
    return;
  }

  let totalResponseTime = 0;

  for (let i = 0; i < tReq.length; i++) {
    totalResponseTime += tRes[i] - tReq[i];
  }

  res.send({ avgLatency: totalResponseTime / tReq.length });
}

async function sendWssDataWithTimeStamp(
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
): Promise<number[]> {
  const tReq: number[] = [];
  for (const x of x_test) {
    tReq.push(Date.now());
    ws.send(JSON.stringify(x));
    await delay(1000);
  }
  return tReq;
}

async function doLoadTesting(
  res: Response,
  amt: number,
  turnOffSAFP: boolean,
) {
  const json: TestRequest = JSON.parse(
    fs.readFileSync('testRequest.json', 'utf8'),
  );

  const fingerprintRequests = json.fingerprintRequests;

  for (let i = 0; i < amt; i++) {
    const ws = new WebSocket('ws://35.219.65.61');
    let randomIndex = Math.floor(
      Math.random() * (fingerprintRequests.length - 1),
    );
    let fingerprint = fingerprintRequests[randomIndex];
    while (fingerprint.npm === undefined) {
      randomIndex = Math.floor(
        Math.random() * (fingerprintRequests.length - 1),
      );
      fingerprint = fingerprintRequests[randomIndex];
    }
    fingerprintRequests.splice(randomIndex, 1);
    if (turnOffSAFP) {
      fingerprint.npm = undefined;
    }
    ws.onopen = async () => {
      await sendWssData(ws, new Array(300).fill(fingerprint));
      ws.close();
    };
  }

  await delay(5 * 60 * 1000);

  res.send('Done');
}

async function analyzeTestResponse() {
  const testRequest: TestRequest = JSON.parse(
    fs.readFileSync('testRequest.json', 'utf8'),
  );

  const testResponse: TestResponse = JSON.parse(
    fs.readFileSync('./test/0.9/testResponse.json', 'utf8'),
  );
  console.log(testResponse.length);

  for (const response of testResponse) {
    const y_pred = response.y_pred;
    const y_true = response.y_true;

    const rooms = await prisma.room.findMany();
    const labelSet = new Set(y_true);
    for (const labelSetEntry of labelSet.keys()) {
      const len = y_true.filter(
        (label) => label == labelSetEntry,
      ).length;
      console.log(
        `Label ${rooms.filter((room) => room.id == labelSetEntry).at(0)?.name} has ${len} entries`,
      );
    }

    const correct = y_pred.filter((pred, index) => {
      return pred.roomId == y_true[index];
    }).length;

    console.log(`Correct: ${correct}`);
    console.log(`Total: ${y_true.length}`);
    console.log(`Accuracy: ${correct / y_true.length}`);
  }
}

async function analyzeTestRequest() {
  const testRequest = JSON.parse(
    fs.readFileSync('testRequest.json', 'utf8'),
  );
  const fingerprintRequests = testRequest.fingerprintRequests;
  const arrayOfLabels: number[] = testRequest.arrayOfLabels;
  console.log(
    `Total fingerprint requests: ${fingerprintRequests.length}`,
  );

  const rooms = await prisma.room.findMany();
  const labelSet = new Set(testRequest.arrayOfLabels);
  for (const labelSetEntry of labelSet.keys()) {
    const len = arrayOfLabels.filter(
      (label) => label == labelSetEntry,
    ).length;
    console.log(
      `Label ${rooms.filter((room) => room.id == labelSetEntry).at(0)?.name} has ${len} entries`,
    );
  }
}

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

  const totalResponse: {
    y_pred: {
      location: { floorId: number; x: number; y: number };
      roomId: number;
    }[];
    y_true: number[];
  }[] = [];
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
          y_true: arrayOfLabels
            .filter((label) => label === distinctLabel)
            .filter((label, index) => index < y_pred.length),
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
): Promise<
  {
    location: {
      floorId: number;
      x: number;
      y: number;
    };
    roomId: number;
  }[]
> => {
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

  const fifteen_mins = 15 * 60 * 1000;
  const now = Date.now();
  const later = now + fifteen_mins;

  while (
    Date.now() < later &&
    y_pred.length !== fingerprints.length
  ) {
    await delay(1000);
  }

  const trueY_pred = y_pred.map((pred) => {
    let room = rooms
      .filter((room) => room.floorId === pred.floorId)
      .filter((room) =>
        pointinPolygon(
          [pred.x, pred.y],
          room.coordinates.map((coord) => [coord.x, coord.y]),
        ),
      )
      .at(0);

    if (room === undefined) {
      room = rooms
        .filter((room) => room.floorId != pred.floorId)
        .filter((room) =>
          pointinPolygon(
            [pred.x, pred.y],
            room.coordinates.map((coord) => [coord.x, coord.y]),
          ),
        )
        .at(0);
    }

    return {
      location: pred,
      roomId: room === undefined ? pred.floorId * -1 : room.id,
    };
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
