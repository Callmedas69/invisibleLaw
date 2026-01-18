interface MintBackgroundProps {
  className?: string;
}

export function MintBackground({ className = "" }: MintBackgroundProps) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Concentric arcs radiating from center */}
      <g stroke="currentColor" fill="none" className="opacity-[0.08]">
        {/* Outer arc */}
        <path
          d="M 10,50 A 40,40 0 0,1 90,50"
          strokeWidth="0.1"
        />
        {/* Middle arc */}
        <path
          d="M 20,50 A 30,30 0 0,1 80,50"
          strokeWidth="0.08"
        />
        {/* Inner arc */}
        <path
          d="M 30,50 A 20,20 0 0,1 70,50"
          strokeWidth="0.06"
        />

        {/* Lower arcs (mirrored) */}
        <path
          d="M 10,50 A 40,40 0 0,0 90,50"
          strokeWidth="0.1"
        />
        <path
          d="M 20,50 A 30,30 0 0,0 80,50"
          strokeWidth="0.08"
        />
        <path
          d="M 30,50 A 20,20 0 0,0 70,50"
          strokeWidth="0.06"
        />
      </g>

      {/* Diagonal lines */}
      <g stroke="currentColor" fill="none" className="opacity-[0.06]">
        {/* Top-left to center area */}
        <line x1="0" y1="0" x2="35" y2="35" strokeWidth="0.08" />
        <line x1="5" y1="0" x2="40" y2="35" strokeWidth="0.06" />

        {/* Top-right to center area */}
        <line x1="100" y1="0" x2="65" y2="35" strokeWidth="0.08" />
        <line x1="95" y1="0" x2="60" y2="35" strokeWidth="0.06" />

        {/* Bottom-left to center area */}
        <line x1="0" y1="100" x2="35" y2="65" strokeWidth="0.08" />
        <line x1="5" y1="100" x2="40" y2="65" strokeWidth="0.06" />

        {/* Bottom-right to center area */}
        <line x1="100" y1="100" x2="65" y2="65" strokeWidth="0.08" />
        <line x1="95" y1="100" x2="60" y2="65" strokeWidth="0.06" />
      </g>

      {/* Horizontal guide line through center */}
      <line
        x1="0"
        y1="50"
        x2="100"
        y2="50"
        stroke="currentColor"
        strokeWidth="0.04"
        className="opacity-[0.04]"
      />

      {/* Vertical guide line through center */}
      <line
        x1="50"
        y1="0"
        x2="50"
        y2="100"
        stroke="currentColor"
        strokeWidth="0.04"
        className="opacity-[0.04]"
      />
    </svg>
  );
}
