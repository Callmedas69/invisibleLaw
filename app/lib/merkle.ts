import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

/**
 * Creates a Merkle tree from a list of addresses.
 * Uses keccak256 hashing (standard for Ethereum/Solidity).
 */
export function createMerkleTree(addresses: string[]): MerkleTree {
  // Normalize addresses to lowercase for consistent hashing
  const leaves = addresses.map((addr) =>
    keccak256(addr.toLowerCase())
  );
  return new MerkleTree(leaves, keccak256, { sortPairs: true });
}

/**
 * Gets the Merkle root as a hex string.
 */
export function getMerkleRoot(tree: MerkleTree): `0x${string}` {
  return `0x${tree.getRoot().toString("hex")}` as `0x${string}`;
}

/**
 * Gets the Merkle proof for an address.
 * Returns an array of hex strings suitable for contract calls.
 */
export function getMerkleProof(
  tree: MerkleTree,
  address: string
): `0x${string}`[] {
  const leaf = keccak256(address.toLowerCase());
  const proof = tree.getProof(leaf);
  return proof.map((p) => `0x${p.data.toString("hex")}` as `0x${string}`);
}

/**
 * Verifies if an address is in the Merkle tree.
 */
export function verifyInTree(tree: MerkleTree, address: string): boolean {
  const leaf = keccak256(address.toLowerCase());
  const proof = tree.getProof(leaf);
  const root = tree.getRoot();
  return tree.verify(proof, leaf, root);
}

/**
 * Checks if an address is in the allowlist (case-insensitive).
 */
export function isAddressInList(
  addresses: string[],
  address: string
): boolean {
  const normalizedAddress = address.toLowerCase();
  return addresses.some((a) => a.toLowerCase() === normalizedAddress);
}
