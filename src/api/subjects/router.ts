import express from 'express';
import prisma from '../../db/prisma-client';

const router = express.Router();

// code to simulate smart campus data
router.post('/create', async (req, res) => {
  const request = req.body as {data: {roomId: number, start: string, end: string, name: string, npm: string}[]}

  for (const data of request.data) {
    try {
      const subject = await prisma.subject.create({
        data: {
          name: data.name,
          students: {
            connectOrCreate: {
              where: {
                npm: data.npm,
              },
              create: {
                npm: data.npm,
              },
            },
          },
          schedules: {
            create: {
              roomId: data.roomId,
              startTime: new Date(data.start),
              endTime: new Date(data.end),
            },
          },
        },
      });

      console.log(subject);
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
      return;
    }
  }

  res.sendStatus(200);
})

export default router;
