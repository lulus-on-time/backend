import { io } from 'socket.io-client';

const client = io('http://34.101.70.143:5000', { forceNew: true });

export default client;