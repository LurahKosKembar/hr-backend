import { Router } from "express";
import { verifyToken } from "@middleware/jwt.js";
import {
  fetchAllLeaveRequest,
  updateLeaveRequestStatus,
} from "@controllers/adminLeaveRequestController.js";

const router = Router();
router.use(verifyToken);

router.get("/", fetchAllLeaveRequest);
router.put("/:id/status", updateLeaveRequestStatus);

export default router;
