import { getKeyPair } from "../../utils/encryptionKeys";
import { expect, it, jest } from "@jest/globals";

describe("getKeyPair", () => {
	it("should return an object with a publicKey and privateKey property", async () => {
		const result = await getKeyPair();
		expect(result).toEqual({
			publicKey: expect.stringMatching(/-----BEGIN PUBLIC KEY-----(.|\n)+-----END PUBLIC KEY-----\n/),
			privateKey: expect.stringMatching(/-----BEGIN PRIVATE KEY-----(.|\n)+-----END PRIVATE KEY-----\n/)
		})
	});

	it("should return a different key pair each time it is called", async () => {
		const keyPair1 = await getKeyPair();
		const keyPair2 = await getKeyPair();
		expect(keyPair1).not.toEqual(keyPair2);
	});

	it('should reject with an error if the key pair cannot be generated', async () => {
		jest.resetModules();
		jest.unstable_mockModule('crypto', () => ({
			generateKeyPair: jest.fn((_, __, callback) => {
				callback(new Error('Key generation failed'));
			})
		}));
		const { getKeyPair } = await import('../../utils/encryptionKeys');
		await expect(getKeyPair()).rejects.toThrow();

		jest.resetModules();
	});
});