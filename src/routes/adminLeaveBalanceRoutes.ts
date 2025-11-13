import { Router } from "express";

import { verifyToken } from "@middleware/jwt.js";
import {
  createBulkLeaveBalances,
  createLeaveBalances,
  destroyBulkLeaveBalances,
  destroyLeaveBalances,
  fetchAllLeaveBalances,
  updateLeaveBalances,
} from "@controllers/adminLeaveBalanceController.js";

const router = Router();
router.use(verifyToken);

router.get("/", fetchAllLeaveBalances);
router.post("/", createLeaveBalances);
router.post("/bulk", createBulkLeaveBalances);
router.put("/:id", updateLeaveBalances);
router.delete("/bulk", destroyBulkLeaveBalances);
router.delete("/:id", destroyLeaveBalances);

export default router;
