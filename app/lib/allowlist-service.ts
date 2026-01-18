import { MerkleTree } from "merkletreejs";
import { Redis } from "@upstash/redis";
import { isAddress } from "viem";
import { createMerkleTree, getMerkleProof } from "./merkle";

// ============================================================================
// Redis Client (Upstash - REST-based, serverless-friendly)
// ============================================================================

// Lazy-initialized Redis client
let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

    if (!url || !token) {
      throw new Error(
        "Redis configuration missing. Set UPSTASH_REDIS_REST_KV_REST_API_URL and UPSTASH_REDIS_REST_KV_REST_API_TOKEN"
      );
    }

    redis = new Redis({ url, token });
  }
  return redis;
}

// Redis key for allowlist addresses (using SET data structure)
const ALLOWLIST_KEY = "allowlist:addresses";

// ============================================================================
// Input Validation
// ============================================================================

/**
 * Validates and normalizes an Ethereum address.
 * @throws Error if address is invalid
 */
function validateAndNormalizeAddress(address: string): string {
  if (!address || typeof address !== "string") {
    throw new Error("Address is required");
  }

  if (!isAddress(address)) {
    throw new Error("Invalid Ethereum address format");
  }

  return address.toLowerCase();
}

// ============================================================================
// Merkle Tree Cache
// ============================================================================

let cachedTree: MerkleTree | null = null;
let cachedAddresses: string[] | null = null;

/**
 * Invalidates the cached Merkle tree and addresses.
 */
export function invalidateMerkleCache(): void {
  cachedTree = null;
  cachedAddresses = null;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Gets the list of allowlisted addresses from Redis.
 */
export async function getAllowlistAddresses(): Promise<string[]> {
  if (cachedAddresses !== null) {
    return cachedAddresses;
  }

  try {
    const addresses = await getRedis().smembers(ALLOWLIST_KEY);
    cachedAddresses = addresses;
    return addresses;
  } catch (error) {
    console.error("[AllowlistService] Failed to fetch addresses:", error);
    throw new Error("Failed to fetch allowlist");
  }
}

/**
 * Gets the Merkle tree (creates and caches if needed).
 */
export async function getMerkleTree(): Promise<MerkleTree> {
  if (!cachedTree) {
    const addresses = await getAllowlistAddresses();
    cachedTree = createMerkleTree(addresses);
  }
  return cachedTree;
}

/**
 * Checks if an address is on the allowlist.
 */
export async function isAllowlisted(address: string): Promise<boolean> {
  const normalizedAddress = validateAndNormalizeAddress(address);

  try {
    const isMember = await getRedis().sismember(ALLOWLIST_KEY, normalizedAddress);
    return isMember === 1;
  } catch (error) {
    console.error("[AllowlistService] Failed to check allowlist:", error);
    throw new Error("Failed to check allowlist status");
  }
}

/**
 * Gets the Merkle proof for an address.
 * Returns null if address is not on the allowlist.
 */
export async function getProofForAddress(
  address: string
): Promise<`0x${string}`[] | null> {
  const normalizedAddress = validateAndNormalizeAddress(address);

  const allowlisted = await isAllowlisted(normalizedAddress);
  if (!allowlisted) {
    return null;
  }

  const tree = await getMerkleTree();
  return getMerkleProof(tree, normalizedAddress);
}

/**
 * Adds an address to the allowlist.
 * Uses atomic SADD operation.
 */
export async function addAddressToAllowlist(address: string): Promise<void> {
  const normalizedAddress = validateAndNormalizeAddress(address);

  try {
    const added = await getRedis().sadd(ALLOWLIST_KEY, normalizedAddress);

    if (added === 0) {
      throw new Error("Address is already on the allowlist");
    }

    invalidateMerkleCache();
  } catch (error) {
    if (error instanceof Error && error.message.includes("already on the")) {
      throw error;
    }
    console.error("[AllowlistService] Failed to add address:", error);
    throw new Error("Failed to add address to allowlist");
  }
}

/**
 * Gets the Merkle root for the current allowlist.
 */
export async function getMerkleRoot(): Promise<`0x${string}`> {
  const tree = await getMerkleTree();
  return tree.getHexRoot() as `0x${string}`;
}
