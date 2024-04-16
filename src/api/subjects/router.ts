import express from "express";
import SubjectRequestBody from "./type";
import prisma from "../../db/prisma-client";

const router = express.Router();

router.post('/create', async (req, res) => {
    const request = req.body as SubjectRequestBody;

    res.send(request)
})