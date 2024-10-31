import express from 'express';
import { fetchParties, addParty, updateParty, deleteParty } from '../controllers/party.js';
import { auth } from '../middleware/verifyToken.js';

const router = express.Router();

// Route for fetching parties from the database
router.get('/', auth, (req, res) => {
	fetchParties(req, res);
});

// Route for adding a party to the database
router.post('/', auth, (req, res) => {
	addParty(req, res);
});

// Route for editing a party in the database
router.patch('/:id', auth, (req, res) => {
	updateParty(req, res);
});

// Route for deleting a party from the database
router.delete('/:id', auth, (req, res) => {
	deleteParty(req, res);
});

export default router;