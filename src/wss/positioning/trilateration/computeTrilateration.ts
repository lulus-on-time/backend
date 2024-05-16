import prisma from '../../../db/prisma-client';
import { AccessPoint } from '@prisma/client';
import {
  baseRssi,
  fourPi,
  freq,
  pathLossExponent,
  speedOfLight,
  trilaterationScaleFactor,
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
  const sortedFp = fingerprints.sort((a, b) => a.rssi - b.rssi);
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
      const ap = await prisma.accessPoint.findFirstOrThrow({
        where: {
          networks: {
            some: {
              bssid: fp.bssid,
            },
          },
        },
        include: {
          room: {
            select: {
              floorId: true,
            },
          },
        },
      });
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
    return {
      data: {
        location: [0, 0],
        poi: 'test',
        floorId: 0,
      },
    };
  }

  const distances = trilaterationAps.map((ap) =>
    calculateDistanceFromAp(ap.rssi),
  );

  const A =
    2 * trilaterationAps[1].xCoordinate -
    2 * trilaterationAps[0].xCoordinate;
  const B =
    2 * trilaterationAps[1].yCoordinate -
    2 * trilaterationAps[0].yCoordinate;
  const C =
    distances[0] ** 2 -
    distances[1] ** 2 -
    trilaterationAps[0].xCoordinate ** 2 +
    trilaterationAps[1].xCoordinate ** 2 -
    trilaterationAps[0].yCoordinate ** 2 +
    trilaterationAps[1].yCoordinate ** 2;
  const D =
    2 * trilaterationAps[2].xCoordinate -
    2 * trilaterationAps[1].xCoordinate;
  const E =
    2 * trilaterationAps[2].yCoordinate -
    2 * trilaterationAps[1].yCoordinate;
  const F =
    distances[1] ** 2 -
    distances[2] ** 2 -
    trilaterationAps[1].xCoordinate ** 2 +
    trilaterationAps[2].xCoordinate ** 2 -
    trilaterationAps[1].yCoordinate ** 2 +
    trilaterationAps[2].yCoordinate ** 2;

  return {
    data: {
      location: [
        (E * C - B * F) / (A * E - B * D),
        (D * C - A * F) / (B * D - A * E),
      ],
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
  return distance;
}

export default computeTrilateration;
