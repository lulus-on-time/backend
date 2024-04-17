import express from 'express';
import SubjectRequestBody from './type';
import prisma from '../../db/prisma-client';

const router = express.Router();

router.post('/create', async (req, res) => {
  const request = req.body as SubjectRequestBody;

  try {
    const subject = await prisma.subject.create({
      data: {
        name: request.name,
        students: {
          connectOrCreate: request.students.map((npm) => {
            return {
              create: {
                npm: npm,
              },
              where: {
                npm: npm,
              },
            };
          }),
        },
        schedules: {
          createMany: {
            data: [...Array(1)].map((_, index) => {
              return {
                roomId: request.schedules.roomId,
                startTime: getStartOrEndDate(
                  request.schedules.day,
                  request.schedules.start,
                  index,
                ),
                endTime: getStartOrEndDate(
                  request.schedules.day,
                  request.schedules.end,
                  index,
                ),
              };
            }),
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

  res.sendStatus(200);
});

function getStartOrEndDate(
  date: string,
  time: string,
  week: number,
): Date {
  const dateObj = new Date(`${date}T${time}+07:00`);
  dateObj.setDate(dateObj.getDate() + week * 7);

  return dateObj;
}

export default router;
