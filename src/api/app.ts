import express from 'express';
import dotenv from 'dotenv';
import roomRouter from './floor/router';

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(port, () => {
  console.log('Express app running on port ' + port);
});

app.get('/', async (req, res) => {
  res.send('Hello world');
});

app.use('/floors', roomRouter);
