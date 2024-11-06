import express from 'express';
import { fetchCandidates, addCandidate, updateCandidate, deleteCandidate } from '../controllers/candidate.js';
import { auth } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/', auth, (req, res) => {
  fetchCandidates(req, res);
});
// Route for adding a candidate to the database
router.post('/', auth, (req, res) => {
  addCandidate(req, res);
});

router.patch('/:id', auth, (req, res) => {
  updateCandidate(req, res);
});

router.delete('/:id', auth, (req, res) => {
  deleteCandidate(req, res);
});

export default router;