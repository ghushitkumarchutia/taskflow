import { Job as BullJob } from "bullmq";
import { prisma } from "../config/database.js";
import {
  emailQueue,
  reportQueue,
  resizeQueue,
  webhookQueue,
  scheduledQueue,
} from "../queues/index.js";
import { JOB_DEFAULTS } from "../config/constants.js";
import { AppError } from "../middleware/error.middleware.js";
import type { JobType, JobStatus } from "@prisma/client";

const queueMap = {
  EMAIL: emailQueue,
  REPORT: reportQueue,
  RESIZE: resizeQueue,
  WEBHOOK: webhookQueue,
  SCHEDULED: scheduledQueue,
} as const;

export const jobService = {
  async createJob(data: {
    type: JobType;
    userId: string;
    payload: any;
    priority?: number;
    scheduledAt?: string;
  }) {
    const job = await prisma.job.create({
      data: {
        type: data.type,
        userId: data.userId,
        payload: data.payload,
        priority: data.priority ?? 0,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      },
    });

    const queue = queueMap[data.type];
    const delay = data.scheduledAt ? Math.max(0, new Date(data.scheduledAt).getTime() - Date.now()) : 0;

    await queue.add(job.id, data.payload, {
      jobId: job.id,
      priority: data.priority,
      delay,
      attempts: JOB_DEFAULTS.RETRY_ATTEMPTS,
      backoff: {
        type: JOB_DEFAULTS.BACKOFF_TYPE,
        delay: JOB_DEFAULTS.BACKOFF_DELAY,
      },
      removeOnComplete: JOB_DEFAULTS.REMOVE_ON_COMPLETE,
      removeOnFail: JOB_DEFAULTS.REMOVE_ON_FAIL,
    });

    return job;
  },

  async getJobById(id: string) {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) throw new AppError(404, "Job not found");
    return job;
  },

  async listJobs(filters: {
    status?: JobStatus;
    type?: JobType;
    page: number;
    limit: number;
  }) {
    const skip = (filters.page - 1) * filters.limit;
    const where = {
      ...(filters.status && { status: filters.status }),
      ...(filters.type && { type: filters.type }),
    };

    const [data, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.job.count({ where }),
    ]);

    return {
      data,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  },

  async cancelJob(id: string) {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) throw new AppError(404, "Job not found");
    if (job.status !== "QUEUED") throw new AppError(409, `Cannot cancel job in ${job.status} state`);

    const queue = queueMap[job.type];
    const bullJob = await queue.getJob(id);
    if (bullJob) await bullJob.remove();

    return prisma.job.update({
      where: { id },
      data: { status: "CANCELLED", completedAt: new Date() },
    });
  },

  async retryJob(id: string) {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) throw new AppError(404, "Job not found");
    if (job.status !== "FAILED") throw new AppError(409, "Only failed jobs can be manually retried");

    const queue = queueMap[job.type];

    const existingBullJob = await BullJob.fromId(queue, id);
    if (existingBullJob) await existingBullJob.remove();

    await prisma.job.update({
      where: { id },
      data: { status: "QUEUED", error: null, progress: 0 },
    });

    await queue.add(job.id, job.payload, {
      jobId: job.id,
      priority: job.priority,
      attempts: JOB_DEFAULTS.RETRY_ATTEMPTS,
      backoff: {
        type: JOB_DEFAULTS.BACKOFF_TYPE,
        delay: JOB_DEFAULTS.BACKOFF_DELAY,
      },
      removeOnComplete: JOB_DEFAULTS.REMOVE_ON_COMPLETE,
      removeOnFail: JOB_DEFAULTS.REMOVE_ON_FAIL,
    });

    return { message: "Job successfully queued for retry" };
  },
};
