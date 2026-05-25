interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ progress, className = "", showLabel = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  const barColor =
    clamped === 100
      ? "bg-accent-green"
      : clamped > 60
        ? "bg-accent-blue"
        : clamped > 30
          ? "bg-accent-yellow"
          : "bg-accent-cyan";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-tertiary">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="min-w-[3ch] text-right text-xs font-semibold tabular-nums text-text-secondary">
          {clamped}%
        </span>
      )}
    </div>
  );
}
