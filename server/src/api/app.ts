import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { jobRouter } from "../routes/job.routes.js";
import { queueRouter } from "../routes/queue.routes.js";
import { errorMiddleware } from "../middleware/error.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { healthCheck } from "../controllers/health.controller.js";
import {
  emailQueue,
  reportQueue,
  resizeQueue,
  webhookQueue,
  scheduledQueue,
} from "../queues/index.js";

const app = express();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(reportQueue),
    new BullMQAdapter(resizeQueue),
    new BullMQAdapter(webhookQueue),
    new BullMQAdapter(scheduledQueue),
  ],
  serverAdapter: serverAdapter,
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many requests",
    message: "Please try again after 15 minutes",
  },
});

app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

app.get("/health", healthCheck);

app.use(limiter);

app.use("/admin/queues", authMiddleware, serverAdapter.getRouter());
app.use("/v1/jobs", jobRouter);
app.use("/v1/queue", queueRouter);

app.use(errorMiddleware);

export default app;
