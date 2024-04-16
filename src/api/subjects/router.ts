import express from "express";
import SubjectRequestBody from "./type";
import prisma from "../../db/prisma-client";

const router = express.Router();

router.post('/create', async (req, res) => {
    const request = req.body as SubjectRequestBody;

    const subject = await prisma.subject.create({
        data: {
            name: request.name,
            students: {
                connect: request.students.map((npm) => ({ npm }))
            },
            schedules: {
                createMany: {
                    roomId: request.schedules.roomId,
                    startTime: request.schedules.start,
                    endTime: request.schedules.end,
                }
            }
            }
        })
})