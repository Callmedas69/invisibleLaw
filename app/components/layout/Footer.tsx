import { contractAddress } from "@/app/config/contract";
import { truncateAddress } from "@/app/lib/format";

export function Footer() {
  const basescanUrl = `https://basescan.org/address/${contractAddress}`;

  return (
    <footer className="border-t border-foreground/10 py-8 mt-auto z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/50">
          {/* Contract Link */}
          <a
            href={basescanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors font-mono text-xs"
          >
            Contract: {truncateAddress(contractAddress, 6)}
          </a>

          {/* Copyright */}
          <p className="font-serif">
            Invisible Law &copy; {new Date().getFullYear()}
          </p>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://opensea.io/collection/invisible-law"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              OpenSea
            </a>
            <a
              href="https://x.com/invisiblelaw"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              X
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
