import express from 'express';
import router from './routes/index.js';
import process from 'process';
import cors from './config/cors.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import redisClient from './utils/redisClient.js';

dotenv.config();
const key = process.env.JWT_KEY;
const app = express();
const PORT = process.env.PORT || 8888;

app.use(cors);
app.use(express.json());
app.use('/api/v1', router);


app.listen(PORT, async () => {
  //await redisClient.connect();
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
  // generate and print jwt token
  const token = jwt.sign(
    {
      user: 'admin',
      role: 'admin'
    },
    key,
    {
      expiresIn: '24h'
    }
  );
  console.log('Token: ', token);
});