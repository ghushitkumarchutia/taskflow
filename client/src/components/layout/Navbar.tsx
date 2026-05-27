import { Link, useLocation } from "react-router-dom";
import { useHealth } from "../../hooks/useHealth";
import { Activity, Zap } from "lucide-react";

export function Navbar() {
  const location = useLocation();
  const { data: health } = useHealth();
  const isLanding = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-border-primary bg-surface-primary/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-accent-blue to-accent-purple shadow-lg shadow-accent-blue/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-text-primary group-hover:text-accent-blue transition-colors">
            TaskFlow
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden items-center gap-1 sm:flex">
          {!isLanding && (
            <>
              <NavLink to="/dashboard" label="Dashboard" />
              <NavLink to="/jobs" label="Jobs" />
              <NavLink to="/jobs/create" label="Create Job" />
              <NavLink to="/queues" label="Queues" />
              <NavLink to="/dead-letter" label="Dead Letter" />
            </>
          )}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Health Indicator */}
          {!isLanding && (
            <div className="flex items-center gap-2 rounded-lg border border-border-primary bg-surface-secondary px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${health?.status === "UP" ? "animate-ping bg-accent-green" : "bg-accent-red"
                    }`}
                />
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${health?.status === "UP" ? "bg-accent-green" : "bg-accent-red"
                    }`}
                />
              </span>
              <span className="text-xs font-medium text-text-secondary">
                {health?.status === "UP" ? "Healthy" : "Degraded"}
              </span>
            </div>
          )}

          {isLanding && (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-accent-blue px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-accent-blue-hover hover:shadow-lg hover:shadow-accent-blue/25"
            >
              <Activity className="h-4 w-4" />
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
          ? "bg-accent-blue/10 text-accent-blue"
          : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
        }`}
    >
      {label}
    </Link>
  );
}
