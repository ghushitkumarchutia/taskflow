import { Request, Response, NextFunction } from "express";
import { queueService } from "../services/queue.service.js";

export const queueController = {
  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await queueService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  async pauseQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await queueService.pauseQueue(req.params.name as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async resumeQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await queueService.resumeQueue(req.params.name as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
