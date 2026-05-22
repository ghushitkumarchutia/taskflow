import { Queue } from "bullmq";
import {
  emailQueue,
  reportQueue,
  resizeQueue,
  webhookQueue,
  scheduledQueue,
} from "../queues/index.js";
import { AppError } from "../middleware/error.middleware.js";

const queues: Record<string, Queue> = {
  email: emailQueue,
  report: reportQueue,
  resize: resizeQueue,
  webhook: webhookQueue,
  scheduled: scheduledQueue,
};

export const queueService = {
  async getStats() {
    const stats = await Promise.all(
      Object.entries(queues).map(async ([name, queue]) => {
        const counts = await queue.getJobCounts();
        return { name, ...counts };
      })
    );
    return stats;
  },

  async pauseQueue(name: string) {
    const queue = queues[name];
    if (!queue) throw new AppError(404, `Queue '${name}' not found`);
    await queue.pause();
    return { message: `Queue ${name} paused` };
  },

  async resumeQueue(name: string) {
    const queue = queues[name];
    if (!queue) throw new AppError(404, `Queue '${name}' not found`);
    await queue.resume();
    return { message: `Queue ${name} resumed` };
  },
};
