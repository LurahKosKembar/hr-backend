import { Router } from "express";
import {
  createMasterDepartments,
  destroyMasterDepartments,
  fetchAllMasterDepartments,
  fetchMasterDepartmentsById,
  updateMasterDepartments,
} from "@controllers/masterDepartmentController.js";
import { verifyToken } from "@middleware/jwt.js";

const router = Router();
router.use(verifyToken);

router.get("/", fetchAllMasterDepartments);
router.get("/:id", fetchMasterDepartmentsById);
router.post("/", createMasterDepartments);
router.put("/:id", updateMasterDepartments);
router.delete("/:id", destroyMasterDepartments);

export default router;
