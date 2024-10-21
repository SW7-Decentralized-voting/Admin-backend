import express from 'express';
import router from './routes/index.js';
import process from 'process';
import cors from './config/cors.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { connectToDb } from './db/index.js';

dotenv.config();
const key = process.env.JWT_KEY;
const app = express();
const PORT = process.env.PORT || 8888;

connectToDb(process.env.MONGO_URI);

app.use(express.json());
app.use(cors);
app.use(express.json());
app.use('/api/v1', router);

app.listen(PORT, async () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});