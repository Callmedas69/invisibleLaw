import { contractAddress } from "@/app/config/contract";
import { truncateAddress } from "@/app/lib/format";
import { PHI_POSITIONS, BAUHAUS_COLORS } from "@/app/config/theme";

// Deterministic color assignment based on cell position
function getCellColor(col: number, row: number): string {
  const index = (col * 8 + row + col + row * 3) % BAUHAUS_COLORS.length;
  return BAUHAUS_COLORS[index];
}

function FooterGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
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
    </div>
  );
}

export function Footer() {
  const basescanUrl = `https://basescan.org/address/${contractAddress}`;

  return (
    <footer className="relative overflow-hidden min-h-screen w-full flex flex-col justify-center">
      {/* Phi grid hover effect */}
      <FooterGrid />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center space-y-12">
        {/* Big headline */}
        <div className="space-y-4">
          <h2 className="font-serif text-5xl sm:text-7xl lg:text-8xl tracking-tight">
            Invisible Law
          </h2>
          <p className="font-mono text-lg sm:text-xl text-foreground/60">
            The Golden Ratio Made Visible
          </p>
        </div>

        {/* Social links - horizontal on desktop, stacked on mobile */}
        <nav className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <a
            href="https://x.com/invisiblelaw"
            target="_blank"
            rel="noopener noreferrer"
            className="font-serif text-2xl sm:text-3xl hover:text-foreground/70 transition-colors"
          >
            X
          </a>
          <span className="hidden sm:block text-foreground/30">/</span>
          <a
            href="https://warpcast.com/invisiblelaw"
            target="_blank"
            rel="noopener noreferrer"
            className="font-serif text-2xl sm:text-3xl hover:text-foreground/70 transition-colors"
          >
            Farcaster
          </a>
          <span className="hidden sm:block text-foreground/30">/</span>
          <a
            href="https://opensea.io/collection/invisible-law"
            target="_blank"
            rel="noopener noreferrer"
            className="font-serif text-2xl sm:text-3xl hover:text-foreground/70 transition-colors"
          >
            OpenSea
          </a>
        </nav>

        {/* Contract & Copyright */}
        <div className="space-y-4 pt-8">
          <a
            href={basescanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-foreground/50 hover:text-foreground transition-colors"
          >
            {truncateAddress(contractAddress, 6)}
          </a>
          <p className="text-foreground/40">
            &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
