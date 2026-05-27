import { useQueueStats, usePauseQueue, useResumeQueue } from "../hooks/useQueues";
import { QueueStatsGrid } from "../components/queues/QueueStatsGrid";
import { QueueControls } from "../components/queues/QueueControls";
import { PageLoader } from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { ApiError } from "../api/client";

export function QueuesPage() {
  const { data: stats, isLoading } = useQueueStats();
  const pauseMutation = usePauseQueue();
  const resumeMutation = useResumeQueue();

  if (isLoading) return <PageLoader />;

  function handlePause(name: string) {
    pauseMutation.mutate(name, {
      onSuccess: (res) => toast.success(res.message),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to pause queue"),
    });
  }

  function handleResume(name: string) {
    resumeMutation.mutate(name, {
      onSuccess: (res) => toast.success(res.message),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to resume queue"),
    });
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Queue Management</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Monitor queue stats and control queue processing
        </p>
      </div>

      {/* Controls */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-text-primary">Controls</h2>
        <QueueControls
          onPause={handlePause}
          onResume={handleResume}
          isPausing={pauseMutation.isPending}
          isResuming={resumeMutation.isPending}
        />
      </div>

      {/* Stats */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-text-primary">Queue Statistics</h2>
        {stats && <QueueStatsGrid stats={stats} />}
      </div>
    </div>
  );
}
