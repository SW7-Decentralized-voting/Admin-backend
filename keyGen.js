import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Generate a JWT token for authentication
 * @returns {string} The generated JWT token
 */
function generateKey() {
	const key = process.env.JWT_KEY;
  const token = jwt.sign(
    {
      user: 'admin',
      role: 'admin'
    },
    key,
    {
      expiresIn: '1h'
    }
  );
  return token;
}
// eslint-disable-next-line no-console
console.log(generateKey());