import prisma from '../../../db/prisma-client';
import { AccessPoint } from '@prisma/client';
import {
  baseRssi,
  fourPi,
  freq,
  pathLossExponent,
  speedOfLight,
} from '../constants';

const computeTrilateration = async (
  fingerprints: {
    rssi: number;
    bssid: string;
  }[],
): Promise<{
  data: {
    location: [number, number];
    poi: string;
    floorId: number;
  };
}> => {
  console.log('Computing trilateration');
  const apsInDb = await prisma.accessPoint.findMany({
    include: {
      networks: true,
      room: {
        select: {
          floorId: true,
        },
      },
    },
  });
  const apSet: Set<(typeof apsInDb)[number]> = new Set();
  const bssidsInDb = apsInDb.flatMap((ap) =>
    ap.networks.map((network) => network.bssid),
  );
  const filteredFp = fingerprints.filter((fp) =>
    bssidsInDb.includes(fp.bssid),
  );
  const sortedFp = filteredFp.sort((a, b) => b.rssi - a.rssi);

  const accessPoints: {
    [floorId: number]: (AccessPoint & {
      room: {
        floorId: number;
      };
    } & { rssi: number })[];
  } = {};

  let trilaterationAps: (AccessPoint & {
    room: {
      floorId: number;
    };
  } & { rssi: number })[] = [];

  for (const fp of sortedFp) {
    try {
      const apCandidates = apsInDb.filter((ap) =>
        ap.networks
          .map((network) => network.bssid)
          .includes(fp.bssid),
      );
      if (apCandidates.length === 0) {
        continue;
      }
      const ap = apCandidates[0];
      if (apSet.has(ap)) {
        continue;
      }
      apSet.add(ap);
      if (accessPoints[ap.room.floorId] === undefined) {
        accessPoints[ap.room.floorId] = [{ ...ap, rssi: fp.rssi }];
      } else {
        accessPoints[ap.room.floorId].push({ ...ap, rssi: fp.rssi });
      }
      if (accessPoints[ap.room.floorId].length === 3) {
        trilaterationAps = accessPoints[ap.room.floorId];
        break;
      }
    } catch (e) {
      console.error(e);
      continue;
    }
  }

  if (trilaterationAps.length != 3) {
    console.log('Trilateration failed');
    return Promise.reject(
      new Error('Trilateration failed because less than 3 APs found'),
    );
  }

  const distances = trilaterationAps.map((ap) => {
    console.log('DESCRIPTION: ', ap.description);
    console.log('RSSI: ', ap.rssi);
    console.log('ID: ', ap.id);
    console.log('AP X: ', ap.xCoordinate);
    console.log('AP Y: ', ap.yCoordinate);
    return calculateDistanceFromAp(ap.rssi);
  });

  const A =
    2 * trilaterationAps[1].xCoordinate -
    2 * trilaterationAps[0].xCoordinate;
  const B =
    2 * trilaterationAps[1].yCoordinate -
    2 * trilaterationAps[0].yCoordinate;
  const C =
    Math.pow(distances[0], 2) -
    Math.pow(distances[1], 2) -
    Math.pow(trilaterationAps[0].xCoordinate, 2) +
    Math.pow(trilaterationAps[1].xCoordinate, 2) -
    Math.pow(trilaterationAps[0].yCoordinate, 2) +
    Math.pow(trilaterationAps[1].yCoordinate, 2);
  const D =
    2 * trilaterationAps[2].xCoordinate -
    2 * trilaterationAps[1].xCoordinate;
  const E =
    2 * trilaterationAps[2].yCoordinate -
    2 * trilaterationAps[1].yCoordinate;
  const F =
    Math.pow(distances[1], 2) -
    Math.pow(distances[2], 2) -
    Math.pow(trilaterationAps[1].xCoordinate, 2) +
    Math.pow(trilaterationAps[2].xCoordinate, 2) -
    Math.pow(trilaterationAps[1].yCoordinate, 2) +
    Math.pow(trilaterationAps[2].yCoordinate, 2);

  const x = (E * C - B * F) / (A * E - B * D);
  const y = (C * D - A * F) / (B * D - A * E);
  console.log('X: ', x);
  console.log('Y: ', y);

  // location coordinate reversed because lat long format.
  return {
    data: {
      location: [y, x],
      poi: 'test',
      floorId: trilaterationAps[0].room.floorId,
    },
  };
};

function calculateDistanceFromAp(rssi: number) {
  const distance =
    speedOfLight /
    fourPi /
    freq /
    Math.pow(rssi / baseRssi, 1 / pathLossExponent);

  console.log('DISTANCE: ', distance);
  console.log(
    speedOfLight /
      fourPi /
      freq /
      Math.pow(0.00001 / baseRssi, 1 / pathLossExponent),
  );
  return distance;
}

export default computeTrilateration;
