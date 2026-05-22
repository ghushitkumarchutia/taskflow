export const JOB_DEFAULTS = Object.freeze({
  RETRY_ATTEMPTS: 5,
  BACKOFF_TYPE: "exponential" as const,
  BACKOFF_DELAY: 2000,
  REMOVE_ON_COMPLETE: { count: 1000 } as const,
  REMOVE_ON_FAIL: { count: 5000, age: 24 * 3600 } as const,
});

export const CONCURRENCY = Object.freeze({
  EMAIL: 10,
  REPORT: 2,
  RESIZE: 5,
  WEBHOOK: 50,
  SCHEDULED: 5,
});

export const CACHE_TTL = 3600;

export const PAGINATION = Object.freeze({
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

export const SHUTDOWN_TIMEOUT = 15000;
