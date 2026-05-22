import { Router } from "express";
import { queueController } from "../controllers/queue.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/stats", queueController.getStats);
router.post("/:name/pause", queueController.pauseQueue);
router.post("/:name/resume", queueController.resumeQueue);

export { router as queueRouter };
