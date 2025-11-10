import { Router } from "express";
import {
  createMasterDivisions,
  destroyMasterDivisions,
  fetchAllMasterDivisions,
  fetchMasterDivisionsById,
  updateMasterDivisions,
} from "@controllers/masterDivisionController.js";
import { verifyToken } from "@middleware/jwt.js";

const router = Router();
router.use(verifyToken);

router.get("/", fetchAllMasterDivisions);
router.get("/:id", fetchMasterDivisionsById);
router.post("/", createMasterDivisions);
router.put("/:id", updateMasterDivisions);
router.delete("/:id", destroyMasterDivisions);

export default router;
