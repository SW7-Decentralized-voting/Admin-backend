import express from 'express';
import { tallyVotes } from '../controllers/tally.js';
import { auth } from '../middleware/verifyToken.js';

const router = express.Router();

// Route for starting an election with no arguments except a token
router.post('/', auth, async (req, res) => {
    tallyVotes(res);
});

export default router;