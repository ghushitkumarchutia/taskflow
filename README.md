<p align="center">
  <h1 align="center">⚡ TaskFlow</h1>
  <p align="center">
    A distributed background job processing system built with Node.js, BullMQ, Redis, and PostgreSQL.
  </p>
  <p align="center">
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-api-reference">API Reference</a> •
    <a href="#-job-types">Job Types</a> •
    <a href="#-monitoring">Monitoring</a> •
    <a href="LICENSE">License</a>
  </p>
</p>

<br />

## 🧠 What Is This?

TaskFlow decouples expensive, time-consuming work from HTTP request handlers. Instead of making a user wait while the server sends an email, generates a report, or resizes an image, the API immediately accepts the request, queues the work, and responds in milliseconds. A separate Worker process picks up the job from the queue and processes it in the background — with automatic retries, exponential backoff, real-time progress streaming, and dead letter queuing for unrecoverable failures.

This is the same architectural pattern used by **Stripe** (payment processing), **Shopify** (order fulfillment), and **Atlassian** (background indexing).

<br />

## 🏗️ Architecture

```
┌─────────────┐       ┌─────────────┐       ┌─────────────────┐
│   Client    │──────▶│ Express API │──────▶│   PostgreSQL    │
│  (Postman)  │◀──────│ (Producer)  │       │  (Job Record)   │
└─────────────┘  HTTP └──────┬──────┘       └─────────────────┘
                             │ queue.add()           ▲
                             ▼                       │ status update
                      ┌─────────────┐                │
                      │    Redis    │       ┌──────-──────────┐
                      │   (BullMQ)  │──────▶│  Worker Process │
                      └─────────────┘ poll  │   (Consumer)    │
                                            └─────────────────┘
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
| **Docker Compose** | Single-command reproducible development environment                                             |

<br />

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js ≥ 20** (for local development)

### Option 1 — Docker Compose (Recommended)

```bash
git clone https://github.com/ghushitkumarchutia/taskflow.git
cd taskflow
cp .env.example .env
docker-compose up --build
```

This starts **four services**: PostgreSQL, Redis, API (port `3000`), and Worker (2 replicas).

### Option 2 — Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL and Redis
docker-compose up postgres redis -d

# 3. Run database migrations
cp .env.example .env
npm run prisma:migrate

# 4. Start API and Worker in separate terminals
npm run dev:api
npm run dev:worker
```

### Verify

```bash
# Health check
curl http://localhost:3000/health

# Expected response:
# { "status": "UP", "services": { "database": "HEALTHY", "redis": "HEALTHY" } }
```

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
├── src/
│   ├── api/          # Express HTTP server setup and Bull Board integration
│   ├── config/       # Environment variables, constants, and Prisma configuration
│   ├── controllers/  # Request handlers for jobs, queues, and health checks
│   ├── jobs/         # Core business logic implementations for each job type
│   ├── middleware/   # Request validation, API authentication, and error handling
│   ├── queues/       # BullMQ instances, Redis connections, and queue workers
│   ├── routes/       # API endpoint definitions and routing
│   ├── schemas/      # Zod validation schemas for request payloads
│   ├── services/     # Shared business logic, cache, and database operations
│   ├── tests/        # Unit and integration tests
│   ├── types/        # TypeScript interfaces and type definitions
│   └── worker.ts     # Standalone worker process entry point
├── prisma/           # Database schema and migration histories
└── [Config Files]    # Docker, package.json, tsconfig, env configs, etc.
```

<br />

## ⚙️ Environment Variables

| Variable       | Required | Default       | Description                           |
| -------------- | -------- | ------------- | ------------------------------------- |
| `DATABASE_URL` | ✅       | —             | PostgreSQL connection string          |
| `REDIS_URL`    | ✅       | —             | Redis connection string               |
| `API_KEY`      | ✅       | —             | API authentication key                |
| `PORT`         | ❌       | `3000`        | HTTP server port                      |
| `NODE_ENV`     | ❌       | `development` | `development` · `production` · `test` |

<br />

## 🐳 Docker

### Multi-Stage Build

The Dockerfile uses a two-stage build:

1. **Builder** — installs all dependencies, generates Prisma client, compiles TypeScript
2. **Production** — copies only compiled JS and production dependencies, runs as non-root `nodejs` user

### Services

| Service    | Image                      | Purpose                   |
| ---------- | -------------------------- | ------------------------- |
| `postgres` | `postgres:16-alpine`       | Persistent job storage    |
| `redis`    | `redis:7-alpine`           | Queue backend + cache     |
| `api`      | Custom build               | HTTP API server           |
| `worker`   | Custom build (×2 replicas) | Background job processing |

### Scaling Workers

```bash
docker-compose up --scale worker=5
```

All worker containers connect to the same Redis queue. BullMQ distributes jobs atomically — no two workers ever process the same job.

<br />

## 🧪 Testing

```bash
npm test
```

Tests use Jest with ESM support and mock Prisma, Nodemailer, and Axios for isolated unit testing of job processors.

<br />

## 🔑 Key Design Decisions

| Decision                                  | Rationale                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------------ |
| **Separate API and Worker processes**     | Independent scaling, isolated failure domains, zero-downtime deployments             |
| **PostgreSQL + Redis dual storage**       | Redis for fast operational queue state; PostgreSQL for durable, queryable history    |
| **BullMQ connection options for Workers** | Workers use blocking Redis commands — each requires its own connection               |
| **Shared connection for Queues**          | Queue instances only use non-blocking commands — safe to share                       |
| **SSE over WebSockets**                   | Unidirectional server→client push — simpler, no special proxy config needed          |
| **Exponential backoff**                   | Prevents thundering herd on downstream service failures                              |
| **Dead letter queue**                     | Failed jobs are preserved for inspection, never silently dropped                     |
| **Cache-aside for reports**               | Deterministic cache keys with sorted filters; 1-hour TTL matches data freshness      |
| **Idempotent processors**                 | Safe against BullMQ's at-least-once delivery — checks completion before re-executing |
| **Zod validation at the edge**            | Request bodies validated and typed before reaching controllers                       |
| **Graceful shutdown**                     | SIGTERM triggers ordered teardown: stop accepting → drain active → close connections |

<br />

## 📄 License

This project is licensed under the [MIT License](LICENSE).
