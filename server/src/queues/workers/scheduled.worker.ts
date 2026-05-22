import { Worker, Job } from "bullmq";
import { connectionOptions } from "../connection.js";
import { QUEUES, deadLetterQueue } from "../index.js";
import { CONCURRENCY, JOB_DEFAULTS } from "../../config/constants.js";
import { prisma } from "../../config/database.js";
import { processScheduled } from "../../jobs/scheduled.job.js";
import type { ScheduledJobPayload } from "../../types/job.types.js";

export const scheduledWorker = new Worker<ScheduledJobPayload>(
  QUEUES.SCHEDULED,
  processScheduled,
  {
    connection: connectionOptions,
    concurrency: CONCURRENCY.SCHEDULED,
  },
);

scheduledWorker.on("completed", (job: Job) => {
  console.log(`[SCHEDULED] Job ${job.id} completed`);
});

scheduledWorker.on("failed", async (job: Job | undefined, err: Error) => {
  if (!job) return;
  const jobId = job.id as string;
  const maxAttempts = job.opts?.attempts ?? JOB_DEFAULTS.RETRY_ATTEMPTS;
  const isTerminal = job.attemptsMade >= maxAttempts;

  await prisma.job.update({
    where: { id: jobId },
    data: {
      ...(isTerminal ? { status: "FAILED", completedAt: new Date() } : {}),
      error: err.message,
      attempts: job.attemptsMade,
    },
  });

  if (isTerminal) {
    await deadLetterQueue.add("dead-letter", {
      originalQueue: QUEUES.SCHEDULED,
      originalJobId: jobId,
      payload: job.data,
      error: err.message,
      failedAt: new Date().toISOString(),
      attempts: job.attemptsMade,
    });
    console.error(`[SCHEDULED] Job ${jobId} moved to dead letter queue`);
  } else {
    console.warn(`[SCHEDULED] Job ${jobId} failed (attempt ${job.attemptsMade}/${maxAttempts}): ${err.message}`);
  }
});
