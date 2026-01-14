import { formatEther } from "viem";

/**
 * Format wei amount to ETH string with specified decimals
 */
export function formatEth(wei: bigint, decimals = 5): string {
  const eth = formatEther(wei);
  const num = parseFloat(eth);
  return num.toFixed(decimals);
}

/**
 * Format wei amount to display string with ETH suffix
 */
export function formatEthDisplay(wei: bigint, decimals = 5): string {
  return `${formatEth(wei, decimals)} ETH`;
}

/**
 * Calculate total mint cost
 */
export function calculateMintCost(pricePerToken: bigint, quantity: number): bigint {
  return pricePerToken * BigInt(quantity);
}

/**
 * Format supply display (e.g., "123 / 618")
 */
export function formatSupply(minted: number, total: number): string {
  return `${minted} / ${total}`;
}

/**
 * Calculate percentage (0-100)
 */
export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
