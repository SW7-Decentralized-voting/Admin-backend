import express from 'express';
import { auth } from '../middleware/verifyToken.js';
import { fetchPollingStations, addPollingStation, updatePollingStation, deletePollingStation } from '../controllers/pollingStation.js';

const router = express.Router();

// Route for fetching polling stations from the database
router.get('/', auth, (req, res) => {
	fetchPollingStations(req, res);
});

// Route for adding a polling station to the database
router.post('/', auth, (req, res) => {
	addPollingStation(req, res);
});

// Route for editing a polling station in the database
router.patch('/:id', auth, (req, res) => {
	updatePollingStation(req, res);
});

// Route for deleting a polling station from the database
router.delete('/:id', auth, (req, res) => {
	deletePollingStation(req, res);
});

export default router;