import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const key = process.env.JWT_KEY;

/**
 * Verifies a JSON Web Token and returns the decoded token if it is valid
 * @param {jwt.Jwt} token A JSON Web Token to verify
 * @returns {jwt.Jwt | null} The decoded token if it is valid, or null if it is not
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, key);
  } catch {
    return null;
  }
}