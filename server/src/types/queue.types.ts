export interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

export interface DeadLetterEntry {
  originalQueue: string;
  originalJobId: string;
  payload: Record<string, unknown>;
  error: string;
  failedAt: string;
  attempts: number;
}
