import { Router } from "express";
import { verifyToken } from "@middleware/jwt.js";
import {
  destroyPayrolls,
  fetchAllPayrolls,
  fetchPayrollsById,
  generateAllPayroll,
  updatePayroll,
} from "@controllers/payrollController.js";

const router = Router();
router.use(verifyToken);

router.post("/generate", generateAllPayroll);
router.get("/", fetchAllPayrolls);
router.get("/:id", fetchPayrollsById);
router.put("/:id", updatePayroll);
router.delete("/:id", destroyPayrolls);

export default router;
