import { Worker, Job } from "bullmq";
import { connectionOptions } from "../connection.js";
import { QUEUES, deadLetterQueue } from "../index.js";
import { CONCURRENCY, JOB_DEFAULTS } from "../../config/constants.js";
import { prisma } from "../../config/database.js";
import { processResize } from "../../jobs/resize.job.js";
import type { ResizeJobPayload } from "../../types/job.types.js";

export const resizeWorker = new Worker<ResizeJobPayload>(
  QUEUES.RESIZE,
  processResize,
  {
    connection: connectionOptions,
    concurrency: CONCURRENCY.RESIZE,
  },
);

resizeWorker.on("completed", (job: Job) => {
  console.log(`[RESIZE] Job ${job.id} completed`);
});

resizeWorker.on("failed", async (job: Job | undefined, err: Error) => {
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
      originalQueue: QUEUES.RESIZE,
      originalJobId: jobId,
      payload: job.data,
      error: err.message,
      failedAt: new Date().toISOString(),
      attempts: job.attemptsMade,
    });
    console.error(`[RESIZE] Job ${jobId} moved to dead letter queue`);
  } else {
    console.warn(`[RESIZE] Job ${jobId} failed (attempt ${job.attemptsMade}/${maxAttempts}): ${err.message}`);
  }
});
