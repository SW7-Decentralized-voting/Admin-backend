import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const key = process.env.JWT_KEY;

export function verifyToken(token) {
  try {
    return jwt.verify(token, key);
  } catch {
    return null;
  }
}