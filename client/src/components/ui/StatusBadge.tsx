import type { JobStatus } from "../../types";

const STATUS_STYLES: Record<JobStatus, string> = {
  QUEUED: "bg-status-queued/15 text-status-queued border-status-queued/30",
  PROCESSING: "bg-status-processing/15 text-status-processing border-status-processing/30",
  COMPLETED: "bg-status-completed/15 text-status-completed border-status-completed/30",
  FAILED: "bg-status-failed/15 text-status-failed border-status-failed/30",
  CANCELLED: "bg-status-cancelled/15 text-status-cancelled border-status-cancelled/30",
};

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${STATUS_STYLES[status]} ${className}`}
    >
      {status === "PROCESSING" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-processing opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-status-processing" />
        </span>
      )}
      {status}
    </span>
  );
}
