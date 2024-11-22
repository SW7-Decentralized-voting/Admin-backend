import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import * as e from 'express';

dotenv.config();
const key = process.env.JWT_KEY;  // Ensure this matches the secret key used for signing JWTs

/**
 * Verify token from headers
 * @param {e.Request} req HTTP request with token in headers
 * @param {e.Response} res HTTP response
 * @param {e.NextFunction} next Next middleware function
 * @returns {void} This function does not return anything, it either calls next() or sends a response
 */
export function auth(req, res, next) {
  // Get the token from the Authorization header, removing the "Bearer " prefix
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // If no token is found, return an error
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, key);
    console.log('Token:', token);
    // Attach the decoded user data to the request object (so it's available in other routes)
    req.user = decoded;

    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    const message = error.name === 'TokenExpiredError'
      ? 'Token has expired'
      : 'Failed to authenticate token';
    return res.status(401).json({ message });
  }
}
