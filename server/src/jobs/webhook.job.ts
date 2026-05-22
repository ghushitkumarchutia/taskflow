import { Job } from "bullmq";
import axios from "axios";
import { prisma } from "../config/database.js";
import type { WebhookJobPayload } from "../types/job.types.js";

export async function processWebhook(job: Job<WebhookJobPayload>): Promise<void> {
  const jobId = job.id as string;
  const { url, method, headers, body } = job.data;

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

  const response = await axios({
    method: (method as "POST" | "PUT" | "PATCH") || "POST",
    url,
    headers: headers || {},
    data: body || {},
    timeout: 30000,
    validateStatus: (status: number) => status >= 200 && status < 300,
  });

  await job.updateProgress(75);

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: "COMPLETED",
      progress: 100,
      completedAt: new Date(),
      result: {
        statusCode: response.status,
        statusText: response.statusText,
      },
    },
  });

  await job.updateProgress(100);
}
