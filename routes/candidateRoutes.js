import express from 'express';
import { fetchCandidates, addCandidate, updateCandidate, deleteCandidate } from '../controllers/candidate.js';
import { auth } from '../middleware/verifyToken.js';

const router = express.Router();

/**
 * @swagger
 * /candidates:
 *   get:
 *     tags: [Candidates]
 *     summary: Fetch candidates
 *     description: Fetch candidates from the database
 *     security: [Authorization: []]
 *     parameters: 
 *        - $ref: '#/components/parameters/candidate/get/_id'
 *        - $ref: '#/components/parameters/candidate/get/name'
 *        - $ref: '#/components/parameters/candidate/get/party'
 *        - $ref: '#/components/parameters/candidate/get/nominationDistrict'
 *        - $ref: '#/components/parameters/candidate/get/createdAt'
 *     responses:
 *       200: 
 *        $ref: '#/components/responses/candidate/200/get'
 *       401:
 *        $ref: '#/components/responses/general/401'
 *       400: 
 *        $ref: '#/components/responses/candidate/400/get'
 */
router.get('/', auth, (req, res) => {
  fetchCandidates(req, res);
});

/**
 * @swagger
 * /candidates:
 *  post:
 *   tags: [Candidates]
 *   summary: Add a candidate
 *   description: Add a candidate to the database
 *   security: [Authorization: []]
 *   requestBody:
 *     $ref: '#/components/reqBody/candidate'
 *   responses:
 *    201:
 *     $ref: '#/components/responses/candidate/201'
 *    400:
 *     $ref: '#/components/responses/candidate/400/post'
 *    401:
 *     $ref: '#/components/responses/general/401'
 */
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

/**
 * @typedef Candidate
 * @property {string} _id - The candidate's ID
 * @property {string} name - The candidate's name
 * @property {string} party - The candidate's party
 * @property {string} constituency - The candidate's constituency
 * @property {string} nominationDistrict - The candidate's nomination district
 * @property {string} pollingStation - The candidate's polling station
 * @property {string} createdAt - The candidate's creation date
 * @property {string} updatedAt - The candidate's last update date
 * @property {string} __v - The candidate's version
 */