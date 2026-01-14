"use client";

import { PHI_POSITIONS, BAUHAUS_COLORS } from "@/app/config/theme";

/**
 * PhiGridBackground
 *
 * A subtle animated background grid based on Phi (golden ratio) positions.
 * Grid lines: 0% — 14.6% — 23.6% — 38.2% — 50% — 61.8% — 76.4% — 85.4% — 100%
 * Includes 64 interactive cells with hover effects using Bauhaus palette.
 */

// Deterministic color assignment based on cell position
function getCellColor(col: number, row: number): string {
  const index = (col * 8 + row + col + row * 3) % BAUHAUS_COLORS.length;
  return BAUHAUS_COLORS[index];
}

export function PhiGridBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Grid cells (8x8 = 64 cells) */}
      {PHI_POSITIONS.slice(0, -1).map((left, col) =>
        PHI_POSITIONS.slice(0, -1).map((top, row) => (
          <div
            key={`cell-${col}-${row}`}
            className="absolute pointer-events-auto phi-cell"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${PHI_POSITIONS[col + 1] - left}%`,
              height: `${PHI_POSITIONS[row + 1] - top}%`,
              // @ts-expect-error CSS custom property for hover color
              "--cell-color": getCellColor(col, row),
            }}
          />
        ))
      )}

      {/* Vertical lines */}
      {PHI_POSITIONS.map((pos, i) => (
        <div
          key={`v-${i}`}
          className="absolute top-0 bottom-0 w-px bg-foreground phi-line"
          style={{
            left: `${pos}%`,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}

      {/* Horizontal lines */}
      {PHI_POSITIONS.map((pos, i) => (
        <div
          key={`h-${i}`}
          className="absolute left-0 right-0 h-px bg-foreground phi-line"
          style={{
            top: `${pos}%`,
            animationDelay: `${(i + 4) * 0.8}s`,
          }}
        />
      ))}
    </div>
  );
}
