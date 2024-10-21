import express from 'express';
import { addCandidate } from '../controllers/candidate.js';
import { auth } from '../middleware/verifyToken.js';

const router = express.Router();

// Route for adding a candidate to the database
router.post('/', auth, (req, res) => {
  try {
    addCandidate(req, res);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/*router.patch('/:id', auth, (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: 'Missing candidate ID' });
  }

  try {
    updateCandidate(id, res);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});*/

export default router;