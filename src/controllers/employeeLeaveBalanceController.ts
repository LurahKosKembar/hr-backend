import { Response } from "express";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import { errorResponse, successResponse } from "@utils/response.js";
import { AuthenticatedRequest } from "@middleware/jwt.js";
import { appLogger } from "@utils/logger.js";
import { DatabaseError } from "types/errorTypes.js";
import { getMasterEmployeesById } from "@models/masterEmployeeModel.js";
import { findEmployeeBalance } from "@models/leaveBalanceModel.js";

/**
 * [GET] /attendances/me - Get current user leave balances
 */
export const fetchUserLeaveBalances = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  // FIX: Because the relation is changed from id to employee code
  // We need to changed it too
  const employeeId = 2;

  try {
    // check if the employee exist or not in database
    const profile = await getMasterEmployeesById(employeeId);

    if (!profile) {
      appLogger.error(
        `FATAL: User ID ${req.user!.id} has no linked Employee profile.`
      );
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Profil pegawai tidak ditemukan.",
        404
      );
    }

    // Get current user leave balance
    const leaveBalances = await findEmployeeBalance(employeeId);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data sisa cuti user berhasil didapatkan",
      leaveBalances,
      201,
      RESPONSE_DATA_KEYS.LEAVE_BALANCES
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    appLogger.error(`Error creating fetch leave balances:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};
