import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import * as e from 'express';

dotenv.config();
const key = process.env.JWT_KEY;

/**
 * Verify token from headers
 * @param {e.Request} req HTTP request with token in headers
 * @param {e.Response} res HTTP response
 * @param {e.NextFunction} next Next middleware function
 * @returns {e.Response} Error message or next middleware function
 */
export function auth(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, key);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Failed to authenticate token' });
  }
  return;
}