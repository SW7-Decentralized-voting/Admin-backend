import express from 'express';
import { auth } from '../middleware/verifyToken.js';
import { addNominationDistrict, deleteNominationDistrict, fetchNominationDistricts, updateNominationDistrict } from '../controllers/nominationDistricts.js';

const router = express.Router();

// Route for fetching nomination districts from the database
router.get('/', auth, (req, res) => {
	fetchNominationDistricts(req, res);
});

// Route for adding a nomination district to the database
router.post('/', auth, (req, res) => {
	addNominationDistrict(req, res);
});

// Route for editing a nomination district in the database
router.patch('/:id', auth, (req, res) => {
	updateNominationDistrict(req, res);
});

// Route for deleting a nomination district from the database
router.delete('/:id', auth, (req, res) => {
	deleteNominationDistrict(req, res);
});

export default router;