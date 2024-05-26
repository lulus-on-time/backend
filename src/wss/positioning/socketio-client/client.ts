import { io } from 'socket.io-client';

const client = io('http://localhost:5001', { forceNew: true });

export default client;