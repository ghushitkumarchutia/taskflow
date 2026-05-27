import type { JobType, JobStatus } from "../../types";

const JOB_TYPES: JobType[] = ["EMAIL", "REPORT", "RESIZE", "WEBHOOK", "SCHEDULED"];
const JOB_STATUSES: JobStatus[] = ["QUEUED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"];

interface JobFiltersProps {
  status: JobStatus | "";
  type: JobType | "";
  onStatusChange: (status: JobStatus | "") => void;
  onTypeChange: (type: JobType | "") => void;
}

export function JobFilters({ status, type, onStatusChange, onTypeChange }: JobFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as JobStatus | "")}
        className="rounded-lg border border-border-primary bg-surface-secondary px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
        aria-label="Filter by status"
      >
        <option value="">All Statuses</option>
        {JOB_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={type}
        onChange={(e) => onTypeChange(e.target.value as JobType | "")}
        className="rounded-lg border border-border-primary bg-surface-secondary px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
        aria-label="Filter by type"
      >
        <option value="">All Types</option>
        {JOB_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {(status || type) && (
        <button
          onClick={() => {
            onStatusChange("");
            onTypeChange("");
          }}
          className="rounded-lg border border-border-primary px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
