import { useDeadLetterJobs } from "../hooks/useJobs";
import { PageLoader } from "../components/ui/LoadingSpinner";
import { EmptyState } from "../components/ui/EmptyState";
import { Skull, Clock } from "lucide-react";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DeadLetterPage() {
  const { data, isLoading } = useDeadLetterJobs();

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary">
          <Skull className="h-6 w-6 text-accent-red" />
          Dead Letter Queue
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {data?.total ?? 0} terminally failed jobs preserved for analysis
        </p>
      </div>

      {(!data || data.data.length === 0) ? (
        <EmptyState
          title="No dead letters"
          description="All jobs are processing normally — no terminal failures to report."
        />
      ) : (
        <div className="space-y-4">
          {data.data.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-accent-red/15 bg-surface-secondary p-5 transition-colors hover:border-accent-red/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-red/10 px-2 py-0.5 text-xs font-semibold uppercase text-accent-red">
                    {entry.originalQueue}
                  </span>
                  <code className="rounded bg-surface-tertiary px-1.5 py-0.5 font-mono text-xs text-text-secondary">
                    {entry.originalJobId.slice(0, 8)}…
                  </code>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(entry.failedAt)}
                </div>
              </div>

              <div className="mb-3 rounded-lg bg-accent-red/5 border border-accent-red/10 px-3 py-2">
                <p className="font-mono text-sm text-accent-red">{entry.error}</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-text-tertiary">
                <span>Attempts: <strong className="text-text-secondary">{entry.attempts}</strong></span>
                {entry.addedAt && <span>Added: {formatDate(entry.addedAt)}</span>}
              </div>

              {entry.payload && Object.keys(entry.payload).length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-medium text-text-tertiary hover:text-text-secondary">
                    View Payload
                  </summary>
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-surface-primary p-3 font-mono text-xs text-text-secondary">
                    {JSON.stringify(entry.payload, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
