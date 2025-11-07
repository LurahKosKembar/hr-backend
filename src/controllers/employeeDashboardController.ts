import { Response } from "express";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import { errorResponse, successResponse } from "@utils/response.js";
import { AuthenticatedRequest } from "@middleware/jwt.js";
import { getMasterEmployeesById } from "@models/masterEmployeeModel.js";
import { appLogger } from "@utils/logger.js";
import { calculateTotalAttendancesAndAbsences } from "@models/dashboardModel.js";
import { findEmployeeBalance } from "@models/leaveBalanceModel.js";
import { DatabaseError } from "types/errorTypes.js";

/**
 * [GET] /metrics - Fetch employees data metrics
 */
export const getMetrics = async (req: AuthenticatedRequest, res: Response) => {
  const employeeId = req.user!.employee_id;

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

    //  Date Handling, allow query params for month and year
    const now = new Date();
    const month = parseInt(req.query.month as string) || now.getMonth() + 1;
    const year = parseInt(req.query.year as string) || now.getFullYear();

    const attendanceMetrics = await calculateTotalAttendancesAndAbsences(
      employeeId,
      month,
      year
    );

    const annualLeaveResult = await findEmployeeBalance(employeeId);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Berhasil mendapatkan data dashboard karyawan",
      {
        ...attendanceMetrics,
        annualLeaveBalance: annualLeaveResult || 0,
      },
      201,
      RESPONSE_DATA_KEYS.EMPLOYEES
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    appLogger.error(`Error fetch employee dashboard:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};
