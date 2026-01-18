interface GeometricArrowsProps {
  className?: string;
  /** Unique ID prefix for SVG markers to avoid conflicts when multiple instances exist */
  id?: string;
  /** Flip the arrows to radiate from top instead of bottom */
  flipVertical?: boolean;
}

export function GeometricArrows({
  className = "",
  id = "geometric",
  flipVertical = false,
}: GeometricArrowsProps) {
  const markerId = `${id}-arrow`;

  // Using viewBox 0 0 100 100 for percentage-like positioning
  // Base positions
  const originY = flipVertical ? 5 : 95;
  const targetY1 = flipVertical ? 85 : 15;
  const targetY2 = flipVertical ? 90 : 10;
  const targetY3 = flipVertical ? 75 : 25;
  const arcY = flipVertical ? 65 : 35;
  const arcControlY = flipVertical ? 80 : 20;

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none opacity-10 hidden md:block ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <marker
          id={markerId}
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path
            d="M0,0 L6,3 L0,6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </marker>
      </defs>

      {/* Radiating lines from origin point */}
      <line
        x1={50}
        y1={originY}
        x2={15}
        y2={targetY1}
        stroke="currentColor"
        strokeWidth="0.08"
        markerEnd={`url(#${markerId})`}
      />
      <line
        x1={50}
        y1={originY}
        x2={50}
        y2={targetY2}
        stroke="currentColor"
        strokeWidth="0.08"
        markerEnd={`url(#${markerId})`}
      />
      <line
        x1={50}
        y1={originY}
        x2={80}
        y2={targetY3}
        stroke="currentColor"
        strokeWidth="0.08"
        markerEnd={`url(#${markerId})`}
      />

      {/* Curved arc */}
      
    </svg>
  );
}
