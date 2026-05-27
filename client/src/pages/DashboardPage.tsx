import { Link } from "react-router-dom";
import { useQueueStats } from "../hooks/useQueues";
import { useHealth } from "../hooks/useHealth";
import { QueueStatsGrid } from "../components/queues/QueueStatsGrid";
import { PageLoader } from "../components/ui/LoadingSpinner";
import { StatCard } from "../components/ui/StatCard";
import {
  PlusCircle,
  Skull,
  Activity,
  Server,
  Database,
  Cpu,
} from "lucide-react";

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQueueStats();
  const { data: health } = useHealth();

  if (statsLoading) return <PageLoader />;

  const totals = stats?.reduce(
    (acc, q) => ({
      waiting: acc.waiting + q.waiting,
      active: acc.active + q.active,
      completed: acc.completed + q.completed,
      failed: acc.failed + q.failed,
    }),
    { waiting: 0, active: 0, completed: 0, failed: 0 }
  ) ?? { waiting: 0, active: 0, completed: 0, failed: 0 };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Real-time overview of all queues and system health
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/jobs/create"
            className="flex items-center gap-2 rounded-lg bg-accent-blue px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-accent-blue-hover hover:shadow-lg hover:shadow-accent-blue/25"
          >
            <PlusCircle className="h-4 w-4" />
            Create Job
          </Link>
          <Link
            to="/dead-letter"
            className="flex items-center gap-2 rounded-lg border border-border-primary px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
          >
            <Skull className="h-4 w-4" />
            Dead Letter
          </Link>
        </div>
      </div>

      {/* System Health */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Waiting"
          value={totals.waiting}
          icon={<Activity className="h-5 w-5" />}
          accentColor="text-accent-cyan"
        />
        <StatCard
          label="Active Processing"
          value={totals.active}
          icon={<Cpu className="h-5 w-5" />}
          accentColor="text-accent-yellow"
        />
        <StatCard
          label="Database"
          value={health?.services?.database === "HEALTHY" ? "Healthy" : "Down"}
          icon={<Database className="h-5 w-5" />}
          accentColor={health?.services?.database === "HEALTHY" ? "text-accent-green" : "text-accent-red"}
        />
        <StatCard
          label="Redis"
          value={health?.services?.redis === "HEALTHY" ? "Healthy" : "Down"}
          icon={<Server className="h-5 w-5" />}
          accentColor={health?.services?.redis === "HEALTHY" ? "text-accent-green" : "text-accent-red"}
        />
      </div>

      {/* Queue Stats */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-text-primary">Queue Overview</h2>
        {stats && <QueueStatsGrid stats={stats} />}
      </div>
    </div>
  );
}
