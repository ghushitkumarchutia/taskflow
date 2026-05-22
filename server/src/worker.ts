import { prisma } from "./config/database.js";
import { connection } from "./queues/connection.js";
import { cacheService } from "./services/cache.service.js";
import { closeAllQueueEvents, closeAllQueues } from "./queues/index.js";
import { emailWorker } from "./queues/workers/email.worker.js";
import { webhookWorker } from "./queues/workers/webhook.worker.js";
import { scheduledWorker } from "./queues/workers/scheduled.worker.js";
import { resizeWorker } from "./queues/workers/resize.worker.js";
import { reportWorker } from "./queues/workers/report.worker.js";
import { SHUTDOWN_TIMEOUT } from "./config/constants.js";

const workers = [emailWorker, webhookWorker, scheduledWorker, resizeWorker, reportWorker];

console.log(`[WORKER] All ${workers.length} workers started`);
console.log(`[WORKER] Queues: email, webhook, scheduled, resize, report`);

async function shutdown(): Promise<void> {
  console.log("[WORKER] Graceful shutdown initiated...");

  setTimeout(() => {
    console.error("[WORKER] Could not close in time, forceful shutdown");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT).unref();

  await Promise.all(workers.map((w) => w.close()));
  console.log("[WORKER] All workers stopped");

  await closeAllQueueEvents();
  await closeAllQueues();
  await cacheService.disconnect();
  await connection.quit();
  await prisma.$disconnect();

  console.log("[WORKER] All connections closed");
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
