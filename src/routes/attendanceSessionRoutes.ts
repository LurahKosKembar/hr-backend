import { Router } from "express";
import { verifyToken } from "@middleware/jwt.js";
import {
  createAttendanceSessions,
  destroyAttendanceSessions,
  fetchAllAttendanceSessions,
  fetchAttendanceSessionsById,
  updateAttendanceSessions,
  updateAttendanceSessionsStatus,
} from "@controllers/attendanceSessionController.js";

const router = Router();
router.use(verifyToken);

router.get("/", fetchAllAttendanceSessions);
router.get("/:id", fetchAttendanceSessionsById);
router.post("/", createAttendanceSessions);
router.put("/:id", updateAttendanceSessions);
router.put("/:id/status", updateAttendanceSessionsStatus);
router.delete("/:id", destroyAttendanceSessions);

export default router;
