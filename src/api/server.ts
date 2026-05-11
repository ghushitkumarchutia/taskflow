import app from "./app.js";
import { config } from "../config/env.js";
import { prisma } from "../config/database.js";
import { connection } from "../queues/connection.js";
import { cacheService } from "../services/cache.service.js";
import { closeAllQueueEvents, closeAllQueues } from "../queues/index.js";

const server = app.listen(config.PORT, () => {
  console.log(`[API] Server running on port ${config.PORT}`);
  console.log(`[API] Environment: ${config.NODE_ENV}`);
});

async function shutdown() {
  console.log("[API] Graceful shutdown initiated...");

  server.close(async () => {
    console.log("[API] HTTP server closed");
    await closeAllQueueEvents();
    await closeAllQueues();
    await cacheService.disconnect();
    await connection.quit();
    await prisma.$disconnect();
    console.log("[API] All connections closed");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("[API] Could not close connections in time, forceful shutdown");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
