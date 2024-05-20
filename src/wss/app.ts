import { WebSocketServer } from 'ws';
import connectionEventListener from './positioning/wss-listener/connection';
import dotenv from 'dotenv';

dotenv.config();
const wsPort = Number(process.env.WSSPORT);

const wss = new WebSocketServer({
  port: wsPort,
});

console.log('WebSocketServer is running on port: ', wsPort);

wss.on('connection', connectionEventListener);
