import { Job } from "bullmq";
import fs from "node:fs";
import { parse } from "csv-parse";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { cacheService } from "../services/cache.service.js";
import type { ReportJobPayload } from "../types/job.types.js";

function buildCacheKey(reportType: string, filters: Record<string, unknown>): string {
  const sortedFilters = Object.keys(filters)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = filters[key];
      return acc;
    }, {});
  return `report:${reportType}:${JSON.stringify(sortedFilters)}`;
}

interface AggregateState {
  sum: number;
  count: number;
}

export async function processReport(job: Job<ReportJobPayload>): Promise<void> {
  const jobId = job.id as string;
  const { reportType, filters, filePath } = job.data;

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

  const cacheKey = buildCacheKey(reportType, filters);
  const cached = await cacheService.get<Record<string, unknown>>(cacheKey);

  if (cached) {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        progress: 100,
        completedAt: new Date(),
        result: { ...cached, fromCache: true } as Prisma.InputJsonValue,
      },
    });
    await job.updateProgress(100);
    return;
  }

  await job.updateProgress(25);

  const aggregates: Record<string, AggregateState> = {};
  let totalRows = 0;
  let numericFields: string[] | null = null;

  await new Promise((resolve, reject) => {
    const parser = fs.createReadStream(filePath).pipe(
      parse({ columns: true, skip_empty_lines: true })
    );

    parser.on("data", (row: Record<string, string>) => {
      if (!numericFields) {
        numericFields = Object.keys(row).filter((key) => !isNaN(Number(row[key])));
        for (const field of numericFields) {
          aggregates[field] = { sum: 0, count: 0 };
        }
      }

      totalRows++;
      for (const field of numericFields) {
        const val = Number(row[field]);
        if (!isNaN(val)) {
          aggregates[field].sum += val;
          aggregates[field].count++;
        }
      }

      if (totalRows % 1000 === 0) {
        job.updateProgress(Math.min(25 + Math.floor(totalRows / 10000) * 5, 90)).catch(() => {});
      }
    });

    parser.on("end", resolve);
    parser.on("error", reject);
  });

  await job.updateProgress(90);

  const finalAggregates: Record<string, { sum: number; avg: number; count: number }> = {};
  for (const field in aggregates) {
    const { sum, count } = aggregates[field];
    finalAggregates[field] = {
      sum,
      avg: count > 0 ? sum / count : 0,
      count,
    };
  }

  const result = {
    reportType,
    filters,
    totalRows,
    aggregates: finalAggregates,
    generatedAt: new Date().toISOString(),
  };

  await cacheService.set(cacheKey, result);

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: "COMPLETED",
      progress: 100,
      completedAt: new Date(),
      result: { ...result, fromCache: false } as unknown as Prisma.InputJsonValue,
    },
  });

  await job.updateProgress(100);
}
