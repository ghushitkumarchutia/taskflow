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
