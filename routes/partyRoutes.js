import express from 'express';
import { addParty } from '../controllers/party.js';
import { auth } from '../middleware/verifyToken.js';

const router = express.Router();

// Route for adding a party to the database
router.post('/', auth, (req, res) => {
	try {
		addParty(req, res);
	} catch {
		return res.status(500).json({ error: 'Internal server error' });
	}
});

export default router;