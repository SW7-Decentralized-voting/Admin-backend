import Candidate from '../schemas/Candidate.js';
import validationError, { checkIdsAndGiveErrors } from '../utils/validationError.js';

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

async function updateCandidate(req, res) {
  const { id } = req.params;
  const candidate = req.body;

  const idErrs = checkIdsAndGiveErrors([{ name: 'party', id: candidate.party }, { name: 'nominationDistrict', id: candidate.nominationDistrict }]);

  console.log(idErrs);

  if (Object.keys(idErrs).length > 0) {
    return res.status(400).json({
      errors: idErrs,
    });
  }

  try {
    const updatedCandidate = await Candidate.findByIdAndUpdate(id, candidate, { new: true, runValidators: true });

    if (!updatedCandidate) {
      return res.status(404).json({
        error: 'Candidate with id \'' + id + '\' not found',
      });
    }

    return res.status(200).json({
      message: 'Candidate updated successfully',
      candidate: updatedCandidate,
    });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        errors: validationError(error),
      });
    }

    // eslint-disable-next-line no-console
    console.error(`Error updating candidate: ${error.message}`);
    return res.status(500).json({
      error: 'An unexpected error occurred while updating candidate',
    });
  }
}

export { addCandidate, updateCandidate };

/**
 * @import { Request, Response } from 'express';
 */