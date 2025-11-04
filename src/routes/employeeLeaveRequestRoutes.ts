import { Router } from "express";
import { verifyToken } from "@middleware/jwt.js";
import { createLeaveRequest } from "@controllers/employeeLeaveRequestController.js";

const router = Router();
router.use(verifyToken);

router.post("/", createLeaveRequest);

export default router;
