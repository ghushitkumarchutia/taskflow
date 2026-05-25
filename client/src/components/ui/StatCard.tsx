import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  accentColor?: string;
  className?: string;
}

export function StatCard({ label, value, icon, accentColor = "text-accent-blue", className = "" }: StatCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-border-primary bg-surface-secondary p-5 transition-all duration-300 hover:border-border-hover hover:bg-surface-tertiary ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-text-primary">{value}</p>
        </div>
        <div className={`rounded-lg bg-surface-tertiary p-2.5 ${accentColor} transition-colors group-hover:bg-surface-hover`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
