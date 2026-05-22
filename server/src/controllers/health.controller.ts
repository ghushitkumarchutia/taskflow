import { Request, Response } from "express";
import { prisma } from "../config/database.js";
import { connection } from "../queues/connection.js";

export const healthCheck = async (_req: Request, res: Response) => {
  try {
    const dbCheck = await prisma.$queryRaw`SELECT 1`;
    const redisCheck = await connection.ping();

    if (dbCheck && redisCheck === "PONG") {
      return res.status(200).json({
        status: "UP",
        timestamp: new Date().toISOString(),
        services: {
          database: "HEALTHY",
          redis: "HEALTHY",
        },
      });
    }

    throw new Error("Service degradation detected");
  } catch (error) {
    return res.status(503).json({
      status: "DOWN",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
