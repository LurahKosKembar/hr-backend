import { Router } from "express";

import { verifyToken } from "@middleware/jwt.js";
import {
  bulkDeleteLeaveBalancesController,
  bulkGrantLeaveBalancesController,
  fetchAllLeaveBalanceReport,
  setSpecificLeaveBalanceController,
} from "@controllers/adminLeaveBalanceController.js";

const router = Router();
router.use(verifyToken);

router.get("/", fetchAllLeaveBalanceReport);
router.post("/", bulkGrantLeaveBalancesController);
router.put("/:employeeId", setSpecificLeaveBalanceController);
router.delete("/bulk", bulkDeleteLeaveBalancesController);

export default router;
