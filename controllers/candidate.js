import * as e from 'express';
import Candidate from '../schemas/Candidate.js';
import validationError from '../utils/validationError.js';

/**
 * Add a candidate to the database
 * @param {e.Request} req Token header and numKeys in body
 * @param {e.Response} res HTTP response
 * @returns {e.Response} Success or error message
 */
async function addCandidate(req, res) {
  const candidate = req.body;
  const newCandidate = new Candidate(candidate);
  newCandidate.save()
    .then(() => {
      return res.status(200).json({
        message: 'Candidate added successfully',
        candidate: newCandidate,
      });
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          errors: validationError(error),
        });
      }
      // eslint-disable-next-line no-console
      console.error(`Error adding candidate: ${error.message}`);
      return res.status(500).json({
        error: 'An unexpected error occured while adding candidate',
      });
    });
}

export { addCandidate };