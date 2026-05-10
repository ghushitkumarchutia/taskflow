import { Queue, QueueEvents } from "bullmq";
import { connection, connectionOptions } from "./connection.js";

export const QUEUES = Object.freeze({
  EMAIL: "email",
  REPORT: "report",
  RESIZE: "resize",
  WEBHOOK: "webhook",
  SCHEDULED: "scheduled",
  DEAD_LETTER: "dead-letter",
} as const);

export const emailQueue = new Queue(QUEUES.EMAIL, { connection });
export const reportQueue = new Queue(QUEUES.REPORT, { connection });
export const resizeQueue = new Queue(QUEUES.RESIZE, { connection });
export const webhookQueue = new Queue(QUEUES.WEBHOOK, { connection });
export const scheduledQueue = new Queue(QUEUES.SCHEDULED, { connection });
export const deadLetterQueue = new Queue(QUEUES.DEAD_LETTER, { connection });

const queueEventInstances: Record<string, QueueEvents> = {};

export function getQueueEvents(queueName: string): QueueEvents {
  if (!queueEventInstances[queueName]) {
    queueEventInstances[queueName] = new QueueEvents(queueName, { connection: connectionOptions });
  }
  return queueEventInstances[queueName];
}

export async function closeAllQueueEvents(): Promise<void> {
  await Promise.all(
    Object.values(queueEventInstances).map((qe) => qe.close())
  );
}

export async function closeAllQueues(): Promise<void> {
  await Promise.all([
    emailQueue.close(),
    reportQueue.close(),
    resizeQueue.close(),
    webhookQueue.close(),
    scheduledQueue.close(),
    deadLetterQueue.close(),
  ]);
}
