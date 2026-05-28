<p align="center">
  <h1 align="center">⚡ TaskFlow</h1>
  <p align="center">
    A distributed background job processing engine with a real-time React dashboard.<br />
    Built with Node.js, BullMQ, Redis, PostgreSQL, React, and Vite.
  </p>
  <p align="center">
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-dashboard">Dashboard</a> •
    <a href="#-api-reference">API Reference</a> •
    <a href="#-job-types">Job Types</a> •
    <a href="#-monitoring">Monitoring</a> •
    <a href="LICENSE">License</a>
  </p>
</p>

<br />

## 🧠 What Is This?

TaskFlow decouples expensive, time-consuming work from HTTP request handlers. Instead of making a user wait while the server sends an email, generates a report, or resizes an image, the API immediately accepts the request, queues the work, and responds in milliseconds. A separate Worker process picks up the job from the queue and processes it in the background — with automatic retries, exponential backoff, real-time progress streaming, and dead letter queuing for unrecoverable failures.

The project ships with a **full-featured React dashboard** for monitoring jobs, managing queues, and creating new jobs — all with real-time SSE streaming and a modern, responsive UI.

This is the same architectural pattern used by **Stripe** (payment processing), **Shopify** (order fulfillment), and **Atlassian** (background indexing).

<br />

## 🏗️ Architecture

```
┌──────────────────┐       ┌─────────────┐       ┌─────────────────┐
│  React Dashboard │──────▶│ Express API │──────▶│   PostgreSQL    │
│   (Vite + TW4)   │◀──SSE─│ (Producer)  │       │  (Job Record)   │
└──────────────────┘  HTTP └──────┬──────┘       └─────────────────┘
                                  │ queue.add()           ▲
                                  ▼                       │ status update
                           ┌─────────────┐                │
                           │    Redis    │       ┌────────────────┐
                           │   (BullMQ)  │──────▶│ Worker Process │
                           └─────────────┘ poll  │   (Consumer)   │
                                                 └────────────────┘
```

**Three distinct roles** — never blurred:

| Role         | Process                | Responsibility                                                                  |
| ------------ | ---------------------- | ------------------------------------------------------------------------------- |
| **Producer** | `npm run start:api`    | Validates input, creates DB record, enqueues job, responds immediately          |
| **Queue**    | Redis (BullMQ)         | Holds jobs in sorted sets, manages state transitions atomically via Lua scripts |
| **Consumer** | `npm run start:worker` | Polls Redis, executes job logic, updates PostgreSQL, handles retries            |

The API and Worker are **separate Node.js processes**. They share no memory, no event loop, and no lifecycle. Scale them independently.

<br />

## 🛠️ Tech Stack

### Backend (`server/`)

| Technology         | Purpose                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| **Node.js 20+**    | Non-blocking I/O runtime — ideal for network-heavy queue operations                             |
| **Express 5**      | Minimal, explicit HTTP framework with zero magic                                                |
| **TypeScript 6**   | Strict mode (`strict: true`) — type safety across the entire codebase                           |
| **BullMQ 5**       | Redis-backed job queue with atomic state machine, stalled job recovery, and exponential backoff |
| **PostgreSQL 16**  | Durable, queryable job history with composite indexes                                           |
| **Prisma 7**       | Type-safe ORM with readable schema definitions and migration tracking                           |
| **Redis 7**        | In-memory queue backend and report result cache                                                 |
| **Zod 4**          | Runtime schema validation with automatic TypeScript type inference                              |
| **Sharp**          | High-performance native image processing via libvips                                            |
| **Nodemailer**     | Email dispatch with Ethereal test accounts                                                      |
| **Bull Board**     | Real-time visual queue monitoring dashboard                                                     |

### Frontend (`client/`)

| Technology              | Purpose                                                              |
| ----------------------- | -------------------------------------------------------------------- |
| **React 19**            | Component-based UI with concurrent rendering                         |
| **Vite 8**              | Lightning-fast dev server with HMR and optimized production builds   |
| **TypeScript 6**        | Full type safety across all components, hooks, and API interactions  |
| **Tailwind CSS 4**      | Utility-first CSS with `@theme` design tokens and dark mode support  |
| **TanStack Query 5**    | Server-state management with automatic caching and background refetch|
| **React Router 7**      | Client-side routing with nested layouts                              |
| **Lucide React**        | Consistent, tree-shakeable SVG icon library                          |
| **React Hot Toast**     | Lightweight, accessible toast notifications                          |

### Infrastructure

| Technology         | Purpose                                                     |
| ------------------ | ----------------------------------------------------------- |
| **Docker Compose** | Single-command reproducible development environment          |
| **npm Workspaces** | Monorepo orchestration with `--prefix` script delegation     |

<br />

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js ≥ 20** (for local development)

### Option 1 — Docker Compose (Recommended)

```bash
git clone https://github.com/ghushitkumarchutia/taskflow.git
cd taskflow
cp server/.env.example server/.env
docker compose up --build
```

This starts **four services**: PostgreSQL, Redis, API (port `3000`), and Worker (2 replicas).

### Option 2 — Local Development

```bash
# 1. Start PostgreSQL and Redis
docker compose up -d postgres redis

# 2. Install dependencies
cd server && npm install && cd ..
cd client && npm install && cd ..

# 3. Configure environment
cp server/.env.example server/.env
cp client/.env.example client/.env

# 4. Run database migrations
npm run prisma:migrate

# 5. Start API, Worker, and Client in separate terminals
npm run dev:api
npm run dev:worker
npm run dev:client
```

### Verify

```bash
# Health check
curl http://localhost:3000/health

# Expected response:
# { "status": "UP", "services": { "database": "HEALTHY", "redis": "HEALTHY" } }

# Dashboard
# Open http://localhost:5173 in your browser
```

<br />

## 📱 Dashboard

The React dashboard provides a complete visual interface for managing the TaskFlow engine.

### Pages

| Page             | Route                | Description                                                   |
| ---------------- | -------------------- | ------------------------------------------------------------- |
| **Landing**      | `/`                  | Product overview with feature highlights and call-to-action    |
| **Dashboard**    | `/dashboard`         | Real-time overview with job counts, queue stats, and health    |
| **Jobs**         | `/dashboard/jobs`    | Paginated job list with status, type, and priority filters     |
| **Job Detail**   | `/dashboard/jobs/:id`| Full job details with SSE live progress streaming              |
| **Create Job**   | `/dashboard/jobs/new`| Form to submit new jobs with type-specific payload fields      |
| **Dead Letters** | `/dashboard/dead-letter` | Inspect and retry jobs that exhausted all retry attempts   |
| **Queues**       | `/dashboard/queues`  | Per-queue statistics with pause/resume/drain controls          |

### Key Frontend Features

- **Real-Time SSE Streaming** — Job progress updates via Server-Sent Events without polling
- **TanStack Query Caching** — Automatic background refetching with stale-while-revalidate strategy
- **Responsive Layout** — Collapsible sidebar with mobile-friendly navigation
- **Status Badges** — Color-coded job status indicators (queued, processing, completed, failed)
- **Toast Notifications** — Instant feedback on job creation, retries, and queue actions
- **Empty States** — Helpful illustrations when no data is available
- **Dark Theme** — Modern dark UI with Tailwind CSS v4 `@theme` design tokens

<br />

## 📋 API Reference

All `/v1/*` endpoints require API key authentication:

```
Authorization: Bearer dev_api_key_secret
```

### Jobs

| Method   | Endpoint               | Description                       |
| -------- | ---------------------- | --------------------------------- |
| `POST`   | `/v1/jobs`             | Submit a new job                  |
| `GET`    | `/v1/jobs`             | List jobs (paginated, filterable) |
| `GET`    | `/v1/jobs/:id`         | Get job by ID                     |
| `GET`    | `/v1/jobs/:id/stream`  | SSE real-time progress stream     |
| `POST`   | `/v1/jobs/:id/retry`   | Retry a failed job                |
| `DELETE` | `/v1/jobs/:id`         | Cancel a queued job               |
| `GET`    | `/v1/jobs/dead-letter` | List dead letter queue entries    |

### Queue Management

| Method | Endpoint                 | Description                 |
| ------ | ------------------------ | --------------------------- |
| `GET`  | `/v1/queue/stats`        | Aggregated queue statistics |
| `POST` | `/v1/queue/:name/pause`  | Pause a queue               |
| `POST` | `/v1/queue/:name/resume` | Resume a queue              |

### System

| Method | Endpoint        | Description                          |
| ------ | --------------- | ------------------------------------ |
| `GET`  | `/health`       | Health check (DB + Redis)            |
| `GET`  | `/admin/queues` | Bull Board dashboard (auth required) |

---

### Submit a Job

```bash
curl -X POST http://localhost:3000/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev_api_key_secret" \
  -d '{
    "type": "EMAIL",
    "userId": "user_001",
    "payload": {
      "to": "user@example.com",
      "subject": "Welcome to TaskFlow",
      "template": "welcome",
      "context": { "name": "John" }
    },
    "priority": 5
  }'
```

**Response** `201 Created`:

```json
{
  "jobId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "queued",
  "estimatedStart": null
}
```

### List Jobs with Filters

```bash
curl "http://localhost:3000/v1/jobs?status=FAILED&type=WEBHOOK&page=1&limit=20" \
  -H "Authorization: Bearer dev_api_key_secret"
```

**Response** `200 OK`:

```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

### Stream Job Progress (SSE)

```bash
curl -N "http://localhost:3000/v1/jobs/a1b2c3d4-.../stream" \
  -H "Authorization: Bearer dev_api_key_secret"
```

```
data: {"progress":10,"status":"PROCESSING"}

data: {"progress":60,"status":"PROCESSING"}

data: {"progress":100,"status":"COMPLETED"}
```

### Schedule a Delayed Job

```bash
curl -X POST http://localhost:3000/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev_api_key_secret" \
  -d '{
    "type": "SCHEDULED",
    "userId": "user_001",
    "payload": {
      "reminderType": "email",
      "target": "user@example.com",
      "message": "Your subscription renews tomorrow"
    },
    "scheduledAt": "2026-12-25T09:00:00Z"
  }'
```

<br />

## 📦 Job Types

| Type          | Concurrency | Description                                                                                                                    |
| ------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **EMAIL**     | 10          | Sends emails via Nodemailer with Ethereal test SMTP. I/O-bound — high concurrency.                                             |
| **REPORT**    | 2           | Parses CSV files, computes aggregates (sum, avg, count). CPU-bound — low concurrency. Results cached in Redis with 1-hour TTL. |
| **RESIZE**    | 5           | Generates three image variants (thumb 150×150, medium 800w, large 1200w) using Sharp/libvips.                                  |
| **WEBHOOK**   | 50          | Delivers HTTP POST requests to external URLs. Pure network I/O — maximum concurrency.                                          |
| **SCHEDULED** | 5           | Delayed job execution. Triggers downstream email jobs when the scheduled time arrives.                                         |

### Job Lifecycle

```
QUEUED ──▶ PROCESSING ──▶ COMPLETED
  │             │
  │             ▼
  │          FAILED ──▶ (retry with backoff) ──▶ QUEUED
  │             │
  │             ▼ (retries exhausted)
  │        DEAD LETTER QUEUE
  │
  ▼
CANCELLED
```

Every job gets **5 retry attempts** with **exponential backoff** (2s → 4s → 8s → 16s → 32s). Jobs that exhaust all retries are moved to the dead letter queue for manual inspection.

<br />

## 📊 Monitoring

### Bull Board Dashboard

Navigate to [`http://localhost:3000/admin/queues`](http://localhost:3000/admin/queues) (requires API key authentication) for a real-time visual dashboard showing:

- Job counts per queue (waiting, active, completed, failed, delayed)
- Individual job inspection with payload and error details
- Manual retry and cleanup controls

### Queue Statistics API

```bash
curl http://localhost:3000/v1/queue/stats \
  -H "Authorization: Bearer dev_api_key_secret"
```

Returns per-queue breakdowns of job counts across all states.

<br />

## 🗄️ Database Schema

Single `Job` model with composite indexes for high-performance queries:

| Field         | Type      | Description                                                    |
| ------------- | --------- | -------------------------------------------------------------- |
| `id`          | UUID      | Primary key, shared with BullMQ job ID                         |
| `userId`      | String    | Owner identifier                                               |
| `type`        | Enum      | `EMAIL` · `REPORT` · `RESIZE` · `WEBHOOK` · `SCHEDULED`        |
| `status`      | Enum      | `QUEUED` · `PROCESSING` · `COMPLETED` · `FAILED` · `CANCELLED` |
| `payload`     | JSONB     | Job-specific input data                                        |
| `result`      | JSONB?    | Output on completion                                           |
| `error`       | String?   | Error message on failure (no stack traces exposed)             |
| `attempts`    | Int       | Number of execution attempts                                   |
| `priority`    | Int       | 0–10, higher = processed first                                 |
| `progress`    | Int       | 0–100, updated during processing                               |
| `scheduledAt` | DateTime? | Delayed execution timestamp                                    |
| `startedAt`   | DateTime? | Worker pickup timestamp                                        |
| `completedAt` | DateTime? | Terminal state timestamp                                       |
| `createdAt`   | DateTime  | Record creation                                                |
| `updatedAt`   | DateTime  | Last modification                                              |

**Indexes**: `[status]` and `[type, status]` for fast filtered queries.

<br />

## 🔧 Project Structure

```
taskflow/
├── client/                     # React frontend (Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── api/                # Fetch wrapper with auth and error handling
│   │   ├── assets/             # Static images and SVGs
│   │   ├── components/
│   │   │   ├── jobs/           # JobsTable, JobFilters, JobDetailCard, CreateJobForm
│   │   │   ├── layout/         # Navbar, Sidebar, Layout shell
│   │   │   ├── queues/         # QueueStatsGrid, QueueControls
│   │   │   └── ui/             # StatusBadge, ProgressBar, Modal, Pagination, etc.
│   │   ├── hooks/              # useJobs, useQueues, useHealth, useJobStream (SSE)
│   │   ├── pages/              # Landing, Dashboard, Jobs, JobDetail, Queues, etc.
│   │   ├── types/              # TypeScript interfaces matching backend DTOs
│   │   ├── App.tsx             # Router configuration
│   │   ├── main.tsx            # React entry point
│   │   └── index.css           # Tailwind v4 @theme design tokens
│   ├── .env.example            # VITE_API_URL, VITE_API_KEY
│   ├── index.html              # SEO-optimized HTML entry
│   ├── vite.config.ts          # Vite config with API proxy
│   └── package.json
│
├── server/                     # Node.js backend (Express + BullMQ)
│   ├── src/
│   │   ├── api/                # Express HTTP server setup and Bull Board integration
│   │   ├── config/             # Environment variables, constants, and Prisma config
│   │   ├── controllers/        # Request handlers for jobs, queues, and health checks
│   │   ├── jobs/               # Core business logic for each job type
│   │   ├── middleware/         # Request validation, API auth, and error handling
│   │   ├── queues/             # BullMQ instances, Redis connections, and workers
│   │   ├── routes/             # API endpoint definitions and routing
│   │   ├── schemas/            # Zod validation schemas for request payloads
│   │   ├── services/           # Shared logic, cache, and database operations
│   │   ├── tests/              # Unit tests (Jest + ts-jest)
│   │   ├── types/              # TypeScript interfaces and type definitions
│   │   └── worker.ts           # Standalone worker process entry point
│   ├── prisma/                 # Database schema and migration history
│   ├── Dockerfile              # Multi-stage build (builder → production)
│   ├── .dockerignore           # Docker build exclusions
│   └── package.json
│
├── docker-compose.yml          # Orchestrates PostgreSQL, Redis, API, and Worker
├── package.json                # Root workspace with delegating scripts
├── .env.example                # Backend environment variable template
├── .gitignore                  # Root-level Git exclusions
├── LICENSE                     # MIT License
└── README.md
```

<br />

## ⚙️ Environment Variables

### Server (`server/.env`)

| Variable       | Required | Default       | Description                           |
| -------------- | -------- | ------------- | ------------------------------------- |
| `DATABASE_URL` | ✅       | —             | PostgreSQL connection string          |
| `REDIS_URL`    | ✅       | —             | Redis connection string               |
| `API_KEY`      | ✅       | —             | API authentication key                |
| `PORT`         | ❌       | `3000`        | HTTP server port                      |
| `NODE_ENV`     | ❌       | `development` | `development` · `production` · `test` |

### Client (`client/.env`)

| Variable       | Required | Default                  | Description             |
| -------------- | -------- | ------------------------ | ----------------------- |
| `VITE_API_URL` | ✅       | `http://localhost:3000`  | Backend API base URL    |
| `VITE_API_KEY` | ✅       | `dev_api_key_secret`     | API authentication key  |

<br />

## 🐳 Docker

### Multi-Stage Build

The `server/Dockerfile` uses a two-stage build:

1. **Builder** — installs all dependencies, generates Prisma client, compiles TypeScript
2. **Production** — copies only compiled JS and production dependencies, runs as non-root `nodejs` user

### Services

| Service    | Image                      | Purpose                   |
| ---------- | -------------------------- | ------------------------- |
| `postgres` | `postgres:16-alpine`       | Persistent job storage    |
| `redis`    | `redis:7-alpine`           | Queue backend + cache     |
| `api`      | Custom build (`server/`)   | HTTP API server           |
| `worker`   | Custom build (×2 replicas) | Background job processing |

### Scaling Workers

```bash
docker compose up --scale worker=5
```

All worker containers connect to the same Redis queue. BullMQ distributes jobs atomically — no two workers ever process the same job.

<br />

## 🧩 Available Scripts

All commands can be run from the **project root** via npm workspace delegation:

| Command                  | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `npm run dev:api`        | Start API server with hot-reload (tsx watch)   |
| `npm run dev:worker`     | Start worker with hot-reload (tsx watch)       |
| `npm run dev:client`     | Start React dev server (Vite, port 5173)       |
| `npm run start:api`      | Start compiled API server (production)         |
| `npm run start:worker`   | Start compiled worker (production)             |
| `npm run build:server`   | Compile backend TypeScript to `server/dist/`   |
| `npm run build:client`   | Build frontend for production                  |
| `npm run prisma:migrate` | Run Prisma database migrations                 |
| `npm run prisma:generate`| Generate Prisma client                         |
| `npm run test:server`    | Run backend unit tests (Jest)                  |

<br />

## 🧪 Testing

```bash
npm run test:server
```

Tests use Jest with ESM support and mock Prisma, Nodemailer, and Axios for isolated unit testing of job processors.

<br />

## 🔑 Key Design Decisions

| Decision                                  | Rationale                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------------ |
| **Monorepo with npm workspaces**         | Single repo for backend + frontend with independent dependency trees                 |
| **Separate API and Worker processes**     | Independent scaling, isolated failure domains, zero-downtime deployments             |
| **PostgreSQL + Redis dual storage**       | Redis for fast operational queue state; PostgreSQL for durable, queryable history    |
| **BullMQ connection options for Workers** | Workers use blocking Redis commands — each requires its own connection               |
| **Shared connection for Queues**          | Queue instances only use non-blocking commands — safe to share                       |
| **SSE over WebSockets**                   | Unidirectional server→client push — simpler, no special proxy config needed          |
| **TanStack Query for server state**       | Automatic caching, background refetch, and stale-while-revalidate strategy           |
| **Tailwind CSS v4 @theme tokens**         | Centralized design system with CSS custom properties for consistent theming          |
| **Exponential backoff**                   | Prevents thundering herd on downstream service failures                              |
| **Dead letter queue**                     | Failed jobs are preserved for inspection, never silently dropped                     |
| **Cache-aside for reports**               | Deterministic cache keys with sorted filters; 1-hour TTL matches data freshness      |
| **Idempotent processors**                 | Safe against BullMQ's at-least-once delivery — checks completion before re-executing |
| **Zod validation at the edge**            | Request bodies validated and typed before reaching controllers                       |
| **Graceful shutdown**                     | SIGTERM triggers ordered teardown: stop accepting → drain active → close connections |

<br />

## 📄 License

This project is licensed under the [MIT License](LICENSE).
