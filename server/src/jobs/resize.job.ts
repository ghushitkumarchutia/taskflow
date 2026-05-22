import { Job } from "bullmq";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";
import { prisma } from "../config/database.js";
import type { ResizeJobPayload } from "../types/job.types.js";

const SIZES = [
  { name: "thumb", width: 150, height: 150 },
  { name: "medium", width: 800, height: null },
  { name: "large", width: 1200, height: null },
] as const;

export async function processResize(job: Job<ResizeJobPayload>): Promise<void> {
  const jobId = job.id as string;
  const { filePath, outputDir } = job.data;

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

  await fs.mkdir(outputDir, { recursive: true });

  const ext = path.extname(filePath);
  const basename = path.basename(filePath, ext);
  const results: Record<string, string> = {};

  for (let i = 0; i < SIZES.length; i++) {
    const size = SIZES[i];
    const outputPath = path.join(outputDir, `${basename}_${size.name}${ext}`);

    const existingFile = await fs.access(outputPath).then(() => true).catch(() => false);
    if (!existingFile) {
      const pipeline = sharp(filePath).resize(size.width, size.height ?? undefined, {
        fit: size.name === "thumb" ? "cover" : "inside",
        withoutEnlargement: true,
      });
      await pipeline.toFile(outputPath);
    }

    results[size.name] = outputPath;
    await job.updateProgress(Math.round(((i + 1) / SIZES.length) * 100));
  }

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: "COMPLETED",
      progress: 100,
      completedAt: new Date(),
      result: results,
    },
  });
}
