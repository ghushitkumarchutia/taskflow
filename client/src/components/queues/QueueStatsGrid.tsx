import type { QueueStats } from "../../types";
import { StatCard } from "../ui/StatCard";
import {
  Clock,
  Play,
  CheckCircle,
  XCircle,
  Timer,
} from "lucide-react";

interface QueueStatsGridProps {
  stats: QueueStats[];
}

const QUEUE_COLORS: Record<string, string> = {
  email: "text-accent-blue",
  report: "text-accent-purple",
  resize: "text-accent-cyan",
  webhook: "text-accent-yellow",
  scheduled: "text-accent-green",
};

export function QueueStatsGrid({ stats }: QueueStatsGridProps) {
  return (
    <div className="space-y-8">
      {stats.map((queue) => (
        <div key={queue.name} className="animate-slide-up">
          <h3 className={`mb-3 flex items-center gap-2 text-lg font-bold capitalize ${QUEUE_COLORS[queue.name] || "text-text-primary"}`}>
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-current" />
            {queue.name}
          </h3>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard
              label="Waiting"
              value={queue.waiting}
              icon={<Clock className="h-5 w-5" />}
              accentColor="text-accent-cyan"
            />
            <StatCard
              label="Active"
              value={queue.active}
              icon={<Play className="h-5 w-5" />}
              accentColor="text-accent-yellow"
            />
            <StatCard
              label="Completed"
              value={queue.completed}
              icon={<CheckCircle className="h-5 w-5" />}
              accentColor="text-accent-green"
            />
            <StatCard
              label="Failed"
              value={queue.failed}
              icon={<XCircle className="h-5 w-5" />}
              accentColor="text-accent-red"
            />
            <StatCard
              label="Delayed"
              value={queue.delayed}
              icon={<Timer className="h-5 w-5" />}
              accentColor="text-accent-purple"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
