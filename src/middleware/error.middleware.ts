import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export class AppError extends Error {
  constructor(public statusCode: number, public message: string) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorMiddleware = (err: any, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: "Error",
      message: err.message,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      return res.status(404).json({
        error: "Error",
        message: "Record not found",
      });
    }
    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Error",
        message: "Duplicate record",
      });
    }
  }

  console.error(`[ERROR] ${req.method} ${req.url}:`, err);

  res.status(500).json({
    error: "Internal Server Error",
    message: "An unexpected error occurred",
  });
};
