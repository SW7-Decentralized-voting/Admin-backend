import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const key = process.env.JWT_KEY;

export function auth(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, key);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Failed to authenticate token' });
  }
}