import { Worker, Job } from "bullmq";
import { connectionOptions } from "../connection.js";
import { QUEUES, deadLetterQueue } from "../index.js";
import { CONCURRENCY, JOB_DEFAULTS } from "../../config/constants.js";
import { prisma } from "../../config/database.js";
import { processWebhook } from "../../jobs/webhook.job.js";
import type { WebhookJobPayload } from "../../types/job.types.js";

export const webhookWorker = new Worker<WebhookJobPayload>(
  QUEUES.WEBHOOK,
  processWebhook,
  {
    connection: connectionOptions,
    concurrency: CONCURRENCY.WEBHOOK,
  },
);

webhookWorker.on("completed", (job: Job) => {
  console.log(`[WEBHOOK] Job ${job.id} completed`);
});

webhookWorker.on("failed", async (job: Job | undefined, err: Error) => {
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
      originalQueue: QUEUES.WEBHOOK,
      originalJobId: jobId,
      payload: job.data,
      error: err.message,
      failedAt: new Date().toISOString(),
      attempts: job.attemptsMade,
    });
    console.error(`[WEBHOOK] Job ${jobId} moved to dead letter queue`);
  } else {
    console.warn(`[WEBHOOK] Job ${jobId} failed (attempt ${job.attemptsMade}/${maxAttempts}): ${err.message}`);
  }
});
