import { Link } from "react-router-dom";
import { StatusBadge } from "../ui/StatusBadge";
import { ProgressBar } from "../ui/ProgressBar";
import { EmptyState } from "../ui/EmptyState";
import type { Job } from "../../types";
import { Clock, Eye } from "lucide-react";

interface JobsTableProps {
  jobs: Job[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function JobsTable({ jobs }: JobsTableProps) {
  if (jobs.length === 0) {
    return <EmptyState title="No jobs found" description="No jobs match the current filters. Try adjusting your search or create a new job." />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border-primary">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border-primary bg-surface-tertiary/50">
            <th className="px-4 py-3 font-semibold text-text-secondary">ID</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Type</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Status</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Progress</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Priority</th>
            <th className="px-4 py-3 font-semibold text-text-secondary">Created</th>
            <th className="px-4 py-3 font-semibold text-text-secondary" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border-primary">
          {jobs.map((job) => (
            <tr
              key={job.id}
              className="transition-colors hover:bg-surface-tertiary/30"
            >
              <td className="px-4 py-3">
                <code className="rounded bg-surface-tertiary px-1.5 py-0.5 font-mono text-xs text-accent-cyan">
                  {job.id.slice(0, 8)}…
                </code>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-purple/10 px-2 py-0.5 text-xs font-semibold text-accent-purple">
                  {job.type}
                </span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={job.status} />
              </td>
              <td className="w-40 px-4 py-3">
                <ProgressBar progress={job.progress} />
              </td>
              <td className="px-4 py-3 tabular-nums text-text-secondary">
                {job.priority}
              </td>
              <td className="px-4 py-3 text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(job.createdAt)}
                </span>
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/jobs/${job.id}`}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-accent-blue transition-colors hover:bg-accent-blue/10"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
