import {
  INVISIBLE_LAW_ADDRESS,
  INVISIBLE_LAW_ABI,
} from "@/abi/InvisibleLaw";

export const contractAddress = INVISIBLE_LAW_ADDRESS;
export const contractABI = INVISIBLE_LAW_ABI;

// Contract constants (mirrored from on-chain for type safety)
export const CONTRACT_CONSTANTS = {
  MAX_SUPPLY: 618,
  MAX_PER_WALLET: 5,
  MAX_PER_TX: 5,
  OWNER_RESERVE: 50,
} as const;
