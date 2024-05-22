import { configDotenv } from 'dotenv';
import { io } from 'socket.io-client';

configDotenv();

const machineLearningServerUrl = process.env.MLURL;

const client = io(
  machineLearningServerUrl !== undefined
    ? machineLearningServerUrl
    : 'http://34.101.70.143:5000',
  { forceNew: true },
);

export default client;
