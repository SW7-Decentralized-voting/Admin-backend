import express from 'express';
import { addCandidate } from '../controllers/candidate.js';
import { verifyToken } from '../utils/verifyToken.js';

const router = express.Router();

/**
 * Route for adding a candidate to the blockchain
 * @param {Express.Request} req Token header and candidate data in body
 * @param {Express.Response} res HTTP response
 * @returns
 * 
 * Example request body:
 * {
 *  "name": "Alice",
 *  "party": "Independent"
 * }
 */
router.post('/add', (req, res) => {
  const token = req.headers.authorization;
  try {
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  addCandidate(req, res);
} catch {
  return res.status(500).json({ error: 'Internal server error' });
}
});

export default router;