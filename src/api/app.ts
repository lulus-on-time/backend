import express from 'express';
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
  // const fingerprints = await prisma.fingerprint.findMany({
  //   select: {
  //     id: true,
  //     locationId: true,
  //     fingerprintDetails: {
  //       select: {
  //         bssid: true,
  //         rssi: true,
  //       },
  //     },
  //     location: {
  //       select: {
  //         name: true,
  //         schedules: {
  //           select: {
  //             Subject: {
  //               select: {
  //                 students: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // });

  // const response = fingerprints.map((fingerprint) => {
  //   if (
  //     fingerprint.location.schedules
  //       ?.at(0)
  //       ?.Subject?.students?.at(0) === null ||
  //     fingerprint.location.schedules
  //       ?.at(0)
  //       ?.Subject?.students?.at(0) === undefined
  //   ) {
  //     res.sendStatus(500);
  //     throw new Error(
  //       `Subject not found for room with name ${fingerprint.location.name}`,
  //     );
  //   }
  //   return {
  //     reason: 'fingerprint',
  //     data: {
  //       fingerprints: fingerprint.fingerprintDetails.map((fpD) => {
  //         return {
  //           bssid: fpD.bssid,
  //           rssi: Math.round(Math.log10(fpD.rssi) * 10),
  //         };
  //       }),
  //     },
  //     npm: fingerprint.location.schedules[0].Subject.students[0].npm,
  //   };
  // });

  // const arrayOfLabels = fingerprints.map((fp) => fp.locationId);

  // res.send(
  //   JSON.stringify({
  //     fingerprintRequests: response,
  //     arrayOfLabels: arrayOfLabels,
  //   }),
  // );

  const rooms = await prisma.room.findMany({
    select: {
      id: true,
      coordinates: true,
      floorId: true,
    },
  });

  const response = JSON.parse(
    fs.readFileSync('testRequest.json', 'utf8'),
  ).fingerprintRequests;

  const websocketArray: WebSocket[] = [];
  const wssResponses: { floorId: number; x: number; y: number }[] =
    [];
  for (let i = 0; i < 10; i++) {
    const ws = new WebSocket('ws://35.219.65.61');
    websocketArray.push(ws);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data.toString()).data;
      wssResponses.push({
        floorId: data.floorId,
        x: data.location[1],
        y: data.location[0],
      });
      console.log(JSON.stringify(event.data));
    };
  }

  let isAllWsConnected = true;
  websocketArray.forEach(
    (ws) => (isAllWsConnected &&= ws.readyState == 1),
  );
  while (!isAllWsConnected) {
    console.log(isAllWsConnected);
    isAllWsConnected = true;
    await delay(1000);
    websocketArray.forEach(
      (ws) => (isAllWsConnected &&= ws.readyState == 1),
    );
  }

  while (response.length > 0) {
    for (const ws of websocketArray) {
      const fpRequest = response.pop();
      console.log(`FP Request Sent: ${JSON.stringify(fpRequest)}`);
      if (fpRequest === undefined) {
        break;
      }
      ws.send(JSON.stringify(fpRequest));
    }
    await delay(1000);
  }

  await delay(5000).then(() => {
    res.send(
      wssResponses.map((location) => {
        const room = rooms
          .filter((room) => room.floorId === location.floorId)
          .filter((room) =>
            pointinPolygon(
              [location.x, location.y],
              room.coordinates.map((c) => [c.x, c.y]),
            ),
          )
          .pop();
        return room?.id;
      }),
    );
  });
});

const delay = (ms: number) =>
  new Promise((res) => setTimeout(res, ms));
