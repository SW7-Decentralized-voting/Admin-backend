import express from 'express';
import { addCandidate, updateCandidate } from '../controllers/candidate.js';
import { auth } from '../middleware/verifyToken.js';

const router = express.Router();

// Route for adding a candidate to the database
router.post('/', auth, (req, res) => {
  addCandidate(req, res);
});

router.patch('/:id', auth, (req, res) => {
  updateCandidate(req, res);
});

export default router;