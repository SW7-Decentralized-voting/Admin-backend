import express from 'express';
import { addCandidate } from '../controllers/candidate.js';
import { auth } from '../middleware/verifyToken.js';
import { Express } from 'express';

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
router.post('/add', auth, (req, res) => {
try {
  addCandidate(req, res);
} catch {
  return res.status(500).json({ error: 'Internal server error' });
}
});

export default router;