// ─── Exact mirrors of backend Prisma enums & types ─────────────────

export type JobType = "EMAIL" | "REPORT" | "RESIZE" | "WEBHOOK" | "SCHEDULED";
export type JobStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";

// ─── Job payloads (mirrors src/types/job.types.ts) ─────────────────

export interface EmailJobPayload {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
}

export interface ReportJobPayload {
  reportType: string;
  filters: Record<string, unknown>;
  filePath: string;
}

export interface ResizeJobPayload {
  filePath: string;
  outputDir: string;
}

export interface WebhookJobPayload {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
}

export interface ScheduledJobPayload {
  reminderType: string;
  target: string;
  message: string;
}

export type JobPayload =
  | EmailJobPayload
  | ReportJobPayload
  | ResizeJobPayload
  | WebhookJobPayload
  | ScheduledJobPayload;

// ─── Prisma Job model (response from GET /v1/jobs/:id) ─────────────

export interface Job {
  id: string;
  userId: string;
  type: JobType;
  status: JobStatus;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error: string | null;
  attempts: number;
  priority: number;
  progress: number;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Create job request body (matches createJobSchema) ─────────────

export interface CreateJobRequest {
  type: JobType;
  userId: string;
  payload: Record<string, unknown>;
  priority?: number;
  scheduledAt?: string;
}

// ─── Create job response ────────────────────────────────────────────

export interface CreateJobResponse {
  jobId: string;
  status: "queued";
  estimatedStart: null;
}

// ─── Paginated list response (matches jobService.listJobs) ─────────

export interface PaginatedJobs {
  data: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Job list query params (matches getJobsQuerySchema) ────────────

export interface JobListParams {
  status?: JobStatus;
  type?: JobType;
  page: number;
  limit: number;
}

// ─── Queue stats (mirrors src/types/queue.types.ts) ────────────────

export interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  [key: string]: string | number;
}

// ─── Dead letter entry (mirrors src/types/queue.types.ts) ──────────

export interface DeadLetterEntry {
  id: string;
  originalQueue: string;
  originalJobId: string;
  payload: Record<string, unknown>;
  error: string;
  failedAt: string;
  attempts: number;
  addedAt: string | null;
}

// ─── Health check response ─────────────────────────────────────────

export interface HealthResponse {
  status: "UP" | "DOWN";
  timestamp: string;
  services?: {
    database: "HEALTHY" | string;
    redis: "HEALTHY" | string;
  };
  error?: string;
}

// ─── SSE stream data ───────────────────────────────────────────────

export interface JobStreamData {
  progress: number;
  status: JobStatus;
  error?: string;
}

// ─── API error ─────────────────────────────────────────────────────

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: Array<{ path: string; message: string }>;
}
