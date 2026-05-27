import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ListTodo,
  PlusCircle,
  Server,
  Skull,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/jobs", icon: ListTodo, label: "Jobs" },
  { to: "/jobs/create", icon: PlusCircle, label: "Create Job" },
  { to: "/queues", icon: Server, label: "Queues" },
  { to: "/dead-letter", icon: Skull, label: "Dead Letter" },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border-primary bg-surface-secondary py-6">
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/jobs"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent-blue/10 text-accent-blue shadow-sm"
                  : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
              }`
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
