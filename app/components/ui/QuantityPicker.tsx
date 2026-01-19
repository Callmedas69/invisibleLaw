"use client";

interface QuantityPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  disabled?: boolean;
}

export function QuantityPicker({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
}: QuantityPickerProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const canDecrement = value > min && !disabled;
  const canIncrement = value < max && !disabled;

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {/* Decrement button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border border-foreground/20
                   hover:border-foreground/40 active:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed
                   focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2
                   transition-colors text-xl sm:text-lg font-mono"
        aria-label="Decrease quantity"
      >
        −
      </button>

      {/* Value display */}
      <span
        className="w-8 sm:w-10 text-center text-xl sm:text-2xl font-mono tabular-nums"
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </span>

      {/* Increment button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={!canIncrement}
        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border border-foreground/20
                   hover:border-foreground/40 active:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed
                   focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2
                   transition-colors text-xl sm:text-lg font-mono"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
