import dotenv from 'dotenv';
import axios from 'axios';
import * as e from 'express';
import { getAllCandidates } from '../utils/candidateHelpers.js';
import { getAllParties } from '../utils/partyHelpers.js';
import { getKeyPair } from '../utils/encryptionKeys.js';
import KeyPair from '../schemas/KeyPair.js';

dotenv.config();
const url = process.env.BLOCKCHAIN_URL + '/tally';

async function tallyVotes(res) {
    // Get private key from database
    // Post privateKey as body to blockchain
    let privateKey;
    
}

export { tallyVotes };