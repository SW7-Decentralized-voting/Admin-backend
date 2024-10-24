import express from 'express';
import { addParty, updateParty  } from '../controllers/party.js';
import { auth } from '../middleware/verifyToken.js';

const router = express.Router();

// Route for adding a party to the database
router.post('/', auth, (req, res) => {
	addParty(req, res);
});

// Route for editing a party in the database
router.patch('/:id', auth, (req, res) => {
	updateParty(req, res);
});

export default router;