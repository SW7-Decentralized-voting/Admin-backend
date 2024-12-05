import * as paillierBigint from 'paillier-bigint';

/**
 * 
 * @returns {Object} A key pair for the Paillier cryptosystem
 */
async function getKeyPair() {
	return paillierBigint.generateRandomKeys(2048);
}

export { getKeyPair };