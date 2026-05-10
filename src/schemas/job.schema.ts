import { z } from "zod";

export const createJobSchema = z.object({
  body: z.object({
    type: z.enum(["EMAIL", "REPORT", "RESIZE", "WEBHOOK", "SCHEDULED"]),
    userId: z.string().min(1),
    payload: z.record(z.string(), z.unknown()),
    priority: z.number().int().min(0).max(10).optional(),
    scheduledAt: z.string().datetime().optional(),
  }),
});

export const getJobsQuerySchema = z.object({
  query: z.object({
    status: z.enum(["QUEUED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]).optional(),
    type: z.enum(["EMAIL", "REPORT", "RESIZE", "WEBHOOK", "SCHEDULED"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const jobIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
