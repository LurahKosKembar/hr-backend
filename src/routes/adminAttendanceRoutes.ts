import { Router } from "express";
import { fetchAllAttendances } from "@controllers/adminAttendanceController.js";
import { verifyToken } from "@middleware/jwt.js";

const router = Router();
router.use(verifyToken);

router.get("/", fetchAllAttendances);

export default router;
