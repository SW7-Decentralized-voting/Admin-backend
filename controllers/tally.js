import dotenv from 'dotenv';
import axios from 'axios';
import KeyPair from '../schemas/KeyPair.js';

dotenv.config();
const url = process.env.BLOCKCHAIN_URL + '/tally';

/**
 * Tally votes by posting the latest private key to the blockchain.
 * @param {object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
async function tallyVotes(res) {
    // Get latest private key from database
    try {
        const privateKey = await KeyPair.findOne().sort({ _id: -1 });
        if (!privateKey) {
            return res.status(404).json({
                error: 'No private key found',
            });
        }
        const response = axios.post(url, {
            privateKey: privateKey.privateKey,
        });
        return res.status(200).json({
            message: 'Votes tallied successfully',
            tally: response.data,
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Error fetching private key: ${error.message}`);
        return res.status(500).json({
            error: 'An unexpected error occurred while fetching the private key',
        });
    }
}

export { tallyVotes };