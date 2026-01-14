interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressBar({ current, total, className = "" }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div className={`w-full ${className}`}>
      {/* Bar container */}
      <div className="h-2 bg-foreground/10 overflow-hidden">
        {/* Fill */}
        <div
          className="h-full bg-foreground transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-foreground/50">
        <span>{current} minted</span>
        <span>{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}
