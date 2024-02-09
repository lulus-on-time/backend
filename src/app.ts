import express, { Express, Request, Response } from 'express';
import { WebSocketServer } from 'ws';
import connectionEventListener from './positioning/wss-listener/connection';
import dotenv from 'dotenv';

const app: Express = express();

dotenv.config();
const host = process.env.HOST;
const port = Number(process.env.SERVERPORT);
const wsPort = Number(process.env.WSSERVERPORT);

app.get('/', async (req: Request, res: Response) => {
  res.status(404).send({
    code: 404,
    errors: {
      reason:
        `This server only accepts websocket connections at port ${wsPort}`,
    },
    data: null,
  });
});

app.listen(port, host != undefined ? host : 'localhost', () => {
  console.log(`Find Myself server listening on port: ${port}`);
});

const wss = new WebSocketServer({
  port: wsPort,
});

wss.on('connection', connectionEventListener);
