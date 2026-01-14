/**
 * Phi Grid positions based on the golden ratio
 * 0% — 14.6% — 23.6% — 38.2% — 50% — 61.8% — 76.4% — 85.4% — 100%
 */
export const PHI_POSITIONS = [0, 14.6, 23.6, 38.2, 50, 61.8, 76.4, 85.4, 100];

/**
 * Bauhaus color palette from InvisibleLaw.sol contract
 */
export const BAUHAUS_COLORS = [
  "#E8505B", // Red/Coral
  "#F9D56E", // Yellow/Gold
  "#F3ECC2", // Cream/Beige
  "#14B1AB", // Teal
  "#9AB8A7", // Sage Green
  "#E89B5B", // Orange
  "#5B8EE8", // Blue
] as const;

export type BauhausColor = (typeof BAUHAUS_COLORS)[number];
