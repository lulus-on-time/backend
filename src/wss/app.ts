import { WebSocketServer } from 'ws';
import connectionEventListener from './positioning/wss-listener/connection';
import dotenv from 'dotenv';

dotenv.config();
const wsPort = Number(process.env.PORT);

const wss = new WebSocketServer({
  port: wsPort,
});

wss.on('connection', connectionEventListener);
