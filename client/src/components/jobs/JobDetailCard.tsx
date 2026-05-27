import { StatusBadge } from "../ui/StatusBadge";
import { ProgressBar } from "../ui/ProgressBar";
import type { Job, JobStreamData } from "../../types";
import { Clock, User, Hash, AlertTriangle, CheckCircle } from "lucide-react";

interface JobDetailCardProps {
  job: Job;
  streamData: JobStreamData | null;
}

function formatDateFull(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function JobDetailCard({ job, streamData }: JobDetailCardProps) {
  const progress = streamData?.progress ?? job.progress;
  const status = streamData?.status ?? job.status;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Job Details</h1>
          <p className="mt-1 font-mono text-sm text-text-secondary">{job.id}</p>
        </div>
        <StatusBadge status={status} className="text-sm" />
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-border-primary bg-surface-secondary p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-text-secondary">Progress</span>
          <span className="text-sm font-bold tabular-nums text-text-primary">{progress}%</span>
        </div>
        <ProgressBar progress={progress} showLabel={false} />
      </div>

      {/* Info Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard icon={<Hash className="h-4 w-4" />} label="Type" value={job.type} />
        <InfoCard icon={<User className="h-4 w-4" />} label="User ID" value={job.userId} />
        <InfoCard icon={<Clock className="h-4 w-4" />} label="Priority" value={String(job.priority)} />
        <InfoCard icon={<Clock className="h-4 w-4" />} label="Attempts" value={String(job.attempts)} />
        <InfoCard icon={<Clock className="h-4 w-4" />} label="Created" value={formatDateFull(job.createdAt)} />
        <InfoCard icon={<Clock className="h-4 w-4" />} label="Started" value={formatDateFull(job.startedAt)} />
        <InfoCard icon={<CheckCircle className="h-4 w-4" />} label="Completed" value={formatDateFull(job.completedAt)} />
        {job.scheduledAt && (
          <InfoCard icon={<Clock className="h-4 w-4" />} label="Scheduled For" value={formatDateFull(job.scheduledAt)} />
        )}
      </div>

      {/* Error */}
      {(job.error || streamData?.error) && (
        <div className="rounded-xl border border-accent-red/30 bg-accent-red/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent-red" />
            <div>
              <p className="font-semibold text-accent-red">Error</p>
              <p className="mt-1 font-mono text-sm text-text-secondary">
                {streamData?.error || job.error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payload */}
      <div className="rounded-xl border border-border-primary bg-surface-secondary p-5">
        <h3 className="mb-3 text-sm font-semibold text-text-secondary">Payload</h3>
        <pre className="overflow-x-auto rounded-lg bg-surface-primary p-4 font-mono text-xs leading-relaxed text-text-secondary">
          {JSON.stringify(job.payload, null, 2)}
        </pre>
      </div>

      {/* Result */}
      {job.result && (
        <div className="rounded-xl border border-accent-green/20 bg-accent-green/5 p-5">
          <h3 className="mb-3 text-sm font-semibold text-accent-green">Result</h3>
          <pre className="overflow-x-auto rounded-lg bg-surface-primary p-4 font-mono text-xs leading-relaxed text-text-secondary">
            {JSON.stringify(job.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-primary bg-surface-secondary p-4">
      <div className="flex items-center gap-2 text-text-tertiary">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-1.5 truncate text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}
