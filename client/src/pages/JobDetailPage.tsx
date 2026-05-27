import { useParams, useNavigate } from "react-router-dom";
import { useJob, useCancelJob, useRetryJob } from "../hooks/useJobs";
import { useJobStream } from "../hooks/useJobStream";
import { JobDetailCard } from "../components/jobs/JobDetailCard";
import { PageLoader } from "../components/ui/LoadingSpinner";
import { ApiError } from "../api/client";
import toast from "react-hot-toast";
import { ArrowLeft, RefreshCw, XCircle } from "lucide-react";

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading, error } = useJob(id!);
  const streamData = useJobStream(id!, job?.status);
  const cancelMutation = useCancelJob();
  const retryMutation = useRetryJob();

  if (isLoading) return <PageLoader />;

  if (error) {
    const message = error instanceof ApiError ? error.message : "Failed to load job";
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-semibold text-accent-red">{message}</p>
        <button
          onClick={() => navigate("/jobs")}
          className="mt-4 text-sm text-accent-blue hover:underline"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  if (!job) return null;

  function handleCancel() {
    cancelMutation.mutate(job!.id, {
      onSuccess: () => toast.success("Job cancelled successfully"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to cancel job"),
    });
  }

  function handleRetry() {
    retryMutation.mutate(job!.id, {
      onSuccess: () => toast.success("Job queued for retry"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to retry job"),
    });
  }

  return (
    <div className="space-y-6">
      {/* Back + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate("/jobs")}
          className="flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </button>

        <div className="flex gap-2">
          {job.status === "QUEUED" && (
            <button
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-accent-red/30 bg-accent-red/10 px-4 py-2 text-sm font-medium text-accent-red transition-colors hover:bg-accent-red/20 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              {cancelMutation.isPending ? "Cancelling…" : "Cancel Job"}
            </button>
          )}
          {job.status === "FAILED" && (
            <button
              onClick={handleRetry}
              disabled={retryMutation.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-accent-blue/30 bg-accent-blue/10 px-4 py-2 text-sm font-medium text-accent-blue transition-colors hover:bg-accent-blue/20 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              {retryMutation.isPending ? "Retrying…" : "Retry Job"}
            </button>
          )}
        </div>
      </div>

      {/* Detail Card */}
      <JobDetailCard job={job} streamData={streamData} />
    </div>
  );
}
