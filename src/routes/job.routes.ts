import { Router } from "express";
import { jobController } from "../controllers/job.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { 
  createJobSchema, 
  getJobsQuerySchema, 
  jobIdParamSchema 
} from "../schemas/job.schema.js";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createJobSchema), jobController.submitJob);
router.get("/", validate(getJobsQuerySchema), jobController.listJobs);
router.get("/dead-letter", jobController.getDeadLetterJobs);
router.get("/:id", validate(jobIdParamSchema), jobController.getJob);
router.get("/:id/stream", validate(jobIdParamSchema), jobController.streamJobProgress);
router.post("/:id/retry", validate(jobIdParamSchema), jobController.retryJob);
router.delete("/:id", validate(jobIdParamSchema), jobController.cancelJob);

export { router as jobRouter };
