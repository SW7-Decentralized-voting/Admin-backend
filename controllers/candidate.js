import Candidate from '../schemas/Candidate.js';
import handleQuery from '../utils/handleQuery.js';
import validationError, { checkIdsAndGiveErrors } from '../utils/validationError.js';


/**
 * Fetch candidates from the database
 * @param {Request} req Express request object possibly containing query parameters (e.g. party, nominationDistrict)
 * @param {Response} res Express response object to send the response
 * @returns {Response} A list of candidates or an error message
 */
async function fetchCandidates(req, res) {
  try {
    const query = handleQuery(req.query, Candidate);
    const candidates = await Candidate.find(query);
    return res.status(200).json(candidates);
  } catch (error) {
    if (error.message.includes('Invalid query parameter')) {
      return res.status(400).json({
        error: error.message,
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID: ' + error.value,
      });
    }

    // eslint-disable-next-line no-console
    console.error(`Error fetching candidates: ${error.message}`);
    return res.status(500).json({
      error: 'An unexpected error occurred while fetching candidates',
    });
  }
}

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

/**
 * Update a candidate in the database by ID
 * @param {Request} req Request object containing the candidate object in the body and the candidate ID in the params
 * @param {Response} res Express response object to send the response
 * @returns {Response} Success or error message
 */
async function updateCandidate(req, res) {
  const { id } = req.params;
  const candidate = req.body;

  const idErrs = checkIdsAndGiveErrors([{ name: 'party', id: candidate.party }, { name: 'nominationDistrict', id: candidate.nominationDistrict }]);

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

/**
 * Delete a candidate from the database by ID.
 * @param {Request} req - Express request object containing the candidate ID in the URL parameters.
 * @param {Response} res - Express response object to send the response.
 * @returns {Response} - A success message and deleted candidate data, or an error message.
 */
async function deleteCandidate(req, res) {
  const { id } = req.params;


  try {
    const deletedCandidate = await Candidate.findByIdAndDelete(id);

    if (!deletedCandidate) {
      return res.status(204).send();
    }

    return res.status(200).json({
      message: 'Candidate deleted successfully',
      candidate: deletedCandidate,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: '\'' + id + '\' (type ' + typeof id + ') is not a valid ObjectId',
      });
    }
    
    // eslint-disable-next-line no-console
    console.error(`Error deleting candidate: ${error.message}`);
    return res.status(500).json({
      error: 'An unexpected error occurred while deleting candidate',
    });
  }
}

export { fetchCandidates, addCandidate, updateCandidate, deleteCandidate };

/**
 * @import { Request, Response } from 'express';
 */