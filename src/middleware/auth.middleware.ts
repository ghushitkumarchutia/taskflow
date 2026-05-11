import { Request, Response, NextFunction } from "express";
import { config } from "../config/env.js";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"];
  if (!header) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing API key",
    });
  }

  const token = header.startsWith("Bearer ") ? header.slice(7) : header;

  if (token !== config.API_KEY) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid API key",
    });
  }

  next();
};
