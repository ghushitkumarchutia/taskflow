import { Request, Response, NextFunction } from "express";
import { jobService } from "../services/job.service.js";
import { getQueueEvents, deadLetterQueue } from "../queues/index.js";
import type { JobType, JobStatus } from "@prisma/client";

export const jobController = {
  async submitJob(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobService.createJob(req.body);
      res.status(201).json({
        jobId: job.id,
        status: "queued",
        estimatedStart: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async getJob(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobService.getJobById(req.params.id as string);
      res.json(job);
    } catch (error) {
      next(error);
    }
  },

  async listJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, type, page, limit } = req.query as unknown as {
        status?: JobStatus;
        type?: JobType;
        page: number;
        limit: number;
      };
      const result = await jobService.listJobs({
        status,
        type,
        page: Number(page),
        limit: Number(limit),
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async cancelJob(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobService.cancelJob(req.params.id as string);
      res.json({ message: "Job cancelled successfully", job });
    } catch (error) {
      next(error);
    }
  },

  async retryJob(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobService.retryJob(req.params.id as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getDeadLetterJobs(_req: Request, res: Response, next: NextFunction) {
    try {
      const jobs = await deadLetterQueue.getJobs(["waiting", "completed", "failed"], 0, 100);
      const entries = jobs.map((j) => ({
        id: j.id,
        ...j.data,
        addedAt: j.timestamp ? new Date(j.timestamp).toISOString() : null,
      }));
      res.json({ data: entries, total: entries.length });
    } catch (error) {
      next(error);
    }
  },

  async streamJobProgress(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id as string;

    try {
      const job = await jobService.getJobById(id);

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      res.write(`data: ${JSON.stringify({ progress: job.progress, status: job.status })}\n\n`);

      if (job.status === "COMPLETED" || job.status === "FAILED" || job.status === "CANCELLED") {
        return res.end();
      }

      const queueEvents = getQueueEvents(job.type.toLowerCase());

      const onProgress = ({ jobId, data }: { jobId: string; data: any }) => {
        if (jobId === id) {
          res.write(`data: ${JSON.stringify({ progress: data, status: "PROCESSING" })}\n\n`);
        }
      };

      const onCompleted = ({ jobId }: { jobId: string }) => {
        if (jobId === id) {
          res.write(`data: ${JSON.stringify({ progress: 100, status: "COMPLETED" })}\n\n`);
          cleanup();
          res.end();
        }
      };

      const onFailed = ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
        if (jobId === id) {
          res.write(`data: ${JSON.stringify({ progress: 0, status: "FAILED", error: failedReason })}\n\n`);
          cleanup();
          res.end();
        }
      };

      const cleanup = () => {
        queueEvents.off("progress", onProgress);
        queueEvents.off("completed", onCompleted);
        queueEvents.off("failed", onFailed);
      };

      queueEvents.on("progress", onProgress);
      queueEvents.on("completed", onCompleted);
      queueEvents.on("failed", onFailed);

      req.on("close", cleanup);
    } catch (error) {
      next(error);
    }
  },
};
