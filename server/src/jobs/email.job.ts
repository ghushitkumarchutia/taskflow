import { Job } from "bullmq";
import nodemailer from "nodemailer";
import { prisma } from "../config/database.js";
import type { EmailJobPayload } from "../types/job.types.js";

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return transporter;
}

export async function processEmail(job: Job<EmailJobPayload>): Promise<void> {
  const jobId = job.id as string;
  const { to, subject, template, context } = job.data;

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

  await job.updateProgress(10);

  const userData = context;
  await job.updateProgress(30);

  const html = `<h1>${template}</h1><pre>${JSON.stringify(userData, null, 2)}</pre>`;
  await job.updateProgress(60);

  const transport = await getTransporter();
  await job.updateProgress(90);

  const info = await transport.sendMail({
    from: '"TaskFlow Engine" <taskflow@example.com>',
    to,
    subject,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: "COMPLETED",
      progress: 100,
      completedAt: new Date(),
      result: {
        messageId: info.messageId,
        accepted: info.accepted,
        previewUrl: previewUrl || null,
      },
    },
  });

  await job.updateProgress(100);
}
