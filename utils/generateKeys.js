import { ethers } from 'ethers';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';

// Function to generate Ethereum wallets
function generateKeys(numKeys) {
    const keys = [];
    for (let i = 0; i < numKeys; i++) {
        const wallet = ethers.Wallet.createRandom();
        keys.push(wallet);
    }
    return keys;
}

// Function to create a Merkle Tree from wallet addresses
function createMerkleTree(keys) {
    const leaves = keys.map(wallet => keccak256(wallet.address));
    const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    return merkleTree;
}

// Example usage
const numKeys = 1000;
const keys = generateKeys(numKeys);
const merkleTree = createMerkleTree(keys);

console.log('Wallets:', keys.map(wallet => wallet.address));
console.log('Merkle Root:', merkleTree.getHexRoot());