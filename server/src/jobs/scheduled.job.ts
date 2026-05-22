import { Job } from "bullmq";
import { prisma } from "../config/database.js";
import { emailQueue } from "../queues/index.js";
import { JOB_DEFAULTS } from "../config/constants.js";
import { AppError } from "../middleware/error.middleware.js";
import type { ScheduledJobPayload } from "../types/job.types.js";

export async function processScheduled(job: Job<ScheduledJobPayload>): Promise<void> {
  const jobId = job.id as string;
  const { reminderType, target, message } = job.data;

  const existing = await prisma.job.findUnique({ where: { id: jobId } });
  if (existing?.status === "COMPLETED") return;

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: "PROCESSING",
      startedAt: existing?.startedAt ?? new Date(),
      attempts: job.attemptsMade + 1,
    },
  });

  await job.updateProgress(25);

  if (reminderType === "email") {
    const emailJob = await prisma.job.create({
      data: {
        userId: existing?.userId ?? "system",
        type: "EMAIL",
        status: "QUEUED",
        payload: {
          to: target,
          subject: `Reminder: ${message}`,
          template: "reminder",
          context: { message, scheduledJobId: jobId },
        },
      },
    });

    await emailQueue.add(emailJob.id, {
      to: target,
      subject: `Reminder: ${message}`,
      template: "reminder",
      context: { message, scheduledJobId: jobId },
    }, {
      jobId: emailJob.id,
      attempts: JOB_DEFAULTS.RETRY_ATTEMPTS,
      backoff: {
        type: JOB_DEFAULTS.BACKOFF_TYPE,
        delay: JOB_DEFAULTS.BACKOFF_DELAY,
      },
      removeOnComplete: JOB_DEFAULTS.REMOVE_ON_COMPLETE,
      removeOnFail: JOB_DEFAULTS.REMOVE_ON_FAIL,
    });

    await job.updateProgress(75);

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        progress: 100,
        completedAt: new Date(),
        result: {
          triggeredJobId: emailJob.id,
          reminderType,
          target,
        },
      },
    });

    await job.updateProgress(100);
    return;
  }

  throw new AppError(400, `Unsupported reminder type: ${reminderType}`);
}
