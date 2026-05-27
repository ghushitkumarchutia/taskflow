import { Link } from "react-router-dom";
import {
  Zap,
  Mail,
  FileText,
  ImageIcon,
  Webhook,
  Clock,
  RefreshCw,
  Skull,
  Activity,
  ArrowRight,
  Shield,
  Gauge,
  Radio,
} from "lucide-react";

const FEATURES = [
  {
    icon: Mail,
    title: "Email Processing",
    description: "Transactional emails with templating, retry logic, and delivery tracking via Ethereal.",
    color: "text-accent-blue",
    bg: "bg-accent-blue/10",
  },
  {
    icon: FileText,
    title: "Report Generation",
    description: "Stream CSV data, compute aggregates, and cache results for instant re-fetches.",
    color: "text-accent-purple",
    bg: "bg-accent-purple/10",
  },
  {
    icon: ImageIcon,
    title: "Image Resizing",
    description: "Sharp-powered multi-size image processing — thumb, medium, and large variants.",
    color: "text-accent-cyan",
    bg: "bg-accent-cyan/10",
  },
  {
    icon: Webhook,
    title: "Webhook Delivery",
    description: "Reliable HTTP webhook dispatch with configurable methods, headers, and timeout.",
    color: "text-accent-yellow",
    bg: "bg-accent-yellow/10",
  },
  {
    icon: Clock,
    title: "Scheduled Jobs",
    description: "Delayed execution with precise scheduling and automatic child job chaining.",
    color: "text-accent-green",
    bg: "bg-accent-green/10",
  },
  {
    icon: Radio,
    title: "Real-time SSE Streaming",
    description: "Live job progress monitoring via Server-Sent Events with zero polling overhead.",
    color: "text-accent-blue",
    bg: "bg-accent-blue/10",
  },
  {
    icon: RefreshCw,
    title: "Smart Retries",
    description: "Exponential backoff with configurable attempts — failed jobs automatically retry up to 5 times.",
    color: "text-accent-yellow",
    bg: "bg-accent-yellow/10",
  },
  {
    icon: Skull,
    title: "Dead Letter Queue",
    description: "Terminally failed jobs are preserved in a dedicated DLQ for analysis and manual recovery.",
    color: "text-accent-red",
    bg: "bg-accent-red/10",
  },
];

const TECH_STACK = [
  "Node.js 20+",
  "Express 5",
  "TypeScript 6",
  "BullMQ",
  "Redis 7",
  "PostgreSQL 16",
  "Prisma ORM",
  "Zod Validation",
  "Docker",
  "Bull Board",
];

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border-primary">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-accent-blue/8 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-20 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-purple/8 blur-[120px]" />

        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:py-40">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-blue/20 bg-accent-blue/5 px-4 py-1.5 text-sm font-medium text-accent-blue">
            <Zap className="h-4 w-4" />
            Distributed Job Processing Engine
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
            Background Jobs,{" "}
            <span className="bg-linear-to-r from-accent-blue via-accent-purple to-accent-cyan bg-clip-text text-transparent">
              Engineered Right
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary">
            Production-grade job processing with BullMQ, Redis, and PostgreSQL.
            Real-time monitoring, smart retries, dead letter queues, and
            horizontally scalable workers — all with zero polling.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="group flex items-center gap-2 rounded-xl bg-accent-blue px-6 py-3 text-sm font-bold text-white shadow-lg shadow-accent-blue/25 transition-all hover:bg-accent-blue-hover hover:shadow-xl hover:shadow-accent-blue/30"
            >
              <Activity className="h-4 w-4" />
              Open Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/jobs/create"
              className="flex items-center gap-2 rounded-xl border border-border-hover bg-surface-secondary px-6 py-3 text-sm font-bold text-text-primary transition-all hover:bg-surface-tertiary hover:border-accent-blue/30"
            >
              Create a Job
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Architecture Stats ───────────────────────────────── */}
      <section className="border-b border-border-primary bg-surface-secondary/50">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-border-primary sm:grid-cols-4">
          {[
            { label: "Job Types", value: "5" },
            { label: "Concurrency", value: "72" },
            { label: "Retry Policy", value: "5×" },
            { label: "Workers", value: "∞" },
          ].map((stat) => (
            <div key={stat.label} className="px-6 py-8 text-center">
              <p className="text-3xl font-extrabold tabular-nums text-text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Everything You Need
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-text-secondary">
            A complete distributed job processing system with real-time
            observability baked in.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-border-primary bg-surface-secondary p-5 transition-all duration-300 hover:border-border-hover hover:bg-surface-tertiary hover:-translate-y-0.5"
            >
              <div className={`mb-4 inline-flex rounded-lg p-2.5 ${f.bg}`}>
                <f.icon className={`h-5 w-5 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-text-primary">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Architecture ────────────────────────────────────── */}
      <section className="border-t border-border-primary bg-surface-secondary/30">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text-primary">
              Production Architecture
            </h2>
            <p className="mt-3 text-text-secondary">
              Horizontally scalable workers, Redis-backed queues, and
              PostgreSQL persistence.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <ArchCard
              icon={<Shield className="h-6 w-6 text-accent-blue" />}
              title="API Gateway"
              items={["Helmet security", "Rate limiting (100/15min)", "Zod validation", "Bearer auth"]}
            />
            <ArchCard
              icon={<Gauge className="h-6 w-6 text-accent-purple" />}
              title="Queue Engine"
              items={["5 dedicated queues", "Dead letter queue", "Priority scheduling", "Exponential backoff"]}
            />
            <ArchCard
              icon={<Activity className="h-6 w-6 text-accent-green" />}
              title="Worker Pool"
              items={["Configurable concurrency", "Graceful shutdown", "SSE progress streaming", "Docker scaling"]}
            />
          </div>
        </div>
      </section>

      {/* ─── Tech Stack ──────────────────────────────────────── */}
      <section className="border-t border-border-primary">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-bold text-text-primary">
            Built With
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {TECH_STACK.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border-primary bg-surface-secondary px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-accent-blue/30 hover:text-accent-blue"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-border-primary bg-surface-secondary/50">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center sm:px-6">
          <p className="text-sm text-text-tertiary">
            TaskFlow Engine — Distributed Background Job Processing
          </p>
        </div>
      </footer>
    </div>
  );
}

function ArchCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-border-primary bg-surface-secondary p-6">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-3 font-bold text-text-primary">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="h-1 w-1 rounded-full bg-accent-blue" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
