import { getKeyPair } from '../../utils/encryptionKeys';
import { expect, it, jest } from '@jest/globals';
import * as paillierBigint from 'paillier-bigint';

// Key gen may take more than 5 seconds
jest.setTimeout(10000);

describe('getKeyPair', () => {
	it('should return an object with a publicKey and privateKey property', async () => {
		const { publicKey, privateKey } = await getKeyPair();
		// Expect to be instance of paillierBigint.PublicKey and paillierBigint.PrivateKey
		expect(publicKey).toBeInstanceOf(paillierBigint.PublicKey);
		expect(privateKey).toBeInstanceOf(paillierBigint.PrivateKey);
	});

	it('should return a different key pair each time it is called', async () => {
		const keyPair1 = await getKeyPair();
		const keyPair2 = await getKeyPair();
		expect(keyPair1).not.toEqual(keyPair2);
	});
});