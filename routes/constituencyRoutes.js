import express from 'express';
import { auth } from '../middleware/verifyToken.js';
import { fetchConstituencies, addConstituency, updateConstituency, deleteConstituency } from '../controllers/constituency.js';

const router = express.Router();

// Route for fetching constituencies from the database
router.get('/', auth, (req, res) => {
	fetchConstituencies(req, res);
});

// Route for adding a constituency to the database
router.post('/', auth, (req, res) => {
	addConstituency(req, res);
});

// Route for editing a constituency in the database
router.patch('/:id', auth, (req, res) => {
	updateConstituency(req, res);
});

// Route for deleting a constituency from the database
router.delete('/:id', auth, (req, res) => {
	deleteConstituency(req, res);
});

export default router;