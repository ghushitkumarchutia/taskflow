import { Pause, Play } from "lucide-react";

const QUEUE_NAMES = ["email", "report", "resize", "webhook", "scheduled"];

interface QueueControlsProps {
  onPause: (name: string) => void;
  onResume: (name: string) => void;
  isPausing: boolean;
  isResuming: boolean;
}

export function QueueControls({ onPause, onResume, isPausing, isResuming }: QueueControlsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {QUEUE_NAMES.map((name) => (
        <div
          key={name}
          className="flex items-center justify-between rounded-xl border border-border-primary bg-surface-secondary p-4"
        >
          <div>
            <p className="font-semibold capitalize text-text-primary">{name}</p>
            <p className="text-xs text-text-tertiary">Queue controls</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPause(name)}
              disabled={isPausing}
              className="flex items-center gap-1.5 rounded-lg border border-accent-yellow/30 bg-accent-yellow/10 px-3 py-1.5 text-xs font-medium text-accent-yellow transition-colors hover:bg-accent-yellow/20 disabled:opacity-50"
            >
              <Pause className="h-3.5 w-3.5" />
              Pause
            </button>
            <button
              onClick={() => onResume(name)}
              disabled={isResuming}
              className="flex items-center gap-1.5 rounded-lg border border-accent-green/30 bg-accent-green/10 px-3 py-1.5 text-xs font-medium text-accent-green transition-colors hover:bg-accent-green/20 disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              Resume
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
