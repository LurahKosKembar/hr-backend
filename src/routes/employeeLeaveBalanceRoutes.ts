import { Router } from "express";
import { verifyToken } from "@middleware/jwt.js";
import { fetchEmployeeLeaveBalance } from "@controllers/employeeLeaveBalanceController.js";

const router = Router();
router.use(verifyToken);

router.get("/me", fetchEmployeeLeaveBalance);

export default router;
