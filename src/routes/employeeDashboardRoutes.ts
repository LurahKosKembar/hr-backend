import { Router } from "express";
import { verifyToken } from "@middleware/jwt.js";
import { getMetrics } from "@controllers/employeeDashboardController.js";

const router = Router();
router.use(verifyToken);

router.get("/metrics", getMetrics);

export default router;
