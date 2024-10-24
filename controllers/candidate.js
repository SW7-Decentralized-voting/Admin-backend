import Candidate from '../schemas/Candidate.js';
import validationError from '../utils/validationError.js';

/**
 * Add a candidate to the database
 * @param {Request} req Request object containing the candidate object in the body
 * @param {Response} res Express response object to send the response
 * @returns {Response} Success or error message
 */
/**
 * Add a candidate to the database
 * @param {Request} req Request object containing the candidate object in the body
 * @param {Response} res Express response object to send the response
 * @returns {Response} Success or error message
 */
async function addCandidate(req, res) {
  const candidate = req.body;
  const newCandidate = new Candidate(candidate);

  try {
    await newCandidate.save();
    return res.status(201).json({
      message: 'Candidate added successfully',
      candidate: newCandidate,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        errors: validationError(error),
      });
    }
    // eslint-disable-next-line no-console
    console.error(`Error adding candidate: ${error.message}`);
    return res.status(500).json({
      error: 'An unexpected error occurred while adding candidate',
    });
  }
}

export { addCandidate };

/**
 * @import { Request, Response } from 'express';
 */