import { Response } from "express";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import { errorResponse, successResponse } from "@utils/response.js";
import { appLogger } from "@utils/logger.js";
import { AuthenticatedRequest } from "@middleware/jwt.js";
import {
  addLeaveRequests,
  getAllLeaveRequests,
} from "@models/leaveRequestModel.js";
import { DatabaseError } from "types/errorTypes.js";
import { getLeaveBalanceByEmployeeAndType } from "@models/leaveBalanceModel.js";
import { calculateWorkdays } from "@utils/dateCalculations.js";
import { addLeaveRequestSchema } from "@schemas/leaveRequestSchema.js";
import { getMasterEmployeesByCode } from "@models/masterEmployeeModel.js";

/**
 * [GET] /leave-requests/me - Fetch all Leave Request belongs to one Employees
 */
export const fetchEmployeeLeaveRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const employeeCode = req.user!.employee_code;

  if (!employeeCode) {
    return errorResponse(
      res,
      API_STATUS.UNAUTHORIZED,
      "Akun ini tidak terhubung dengan data pegawai.",
      401
    );
  }
  try {
    const leaveRequest = await getAllLeaveRequests({ employeeCode });

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Permintaan Cuti berhasil di dapatkan",
      leaveRequest,
      200,
      RESPONSE_DATA_KEYS.LEAVE_REQUESTS
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching leave request:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [POST] /leave-requests - Create a new leave request
 */
export const createLeaveRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const employeeCode = req.user!.employee_code;

  if (!employeeCode) {
    return errorResponse(
      res,
      API_STATUS.UNAUTHORIZED,
      "Akun ini tidak terhubung dengan data pegawai.",
      401
    );
  }

  try {
    const validation = addLeaveRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "Validasi gagal",
        400,
        validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        }))
      );
    }

    // check if the employee exist or not in database
    const profile = await getMasterEmployeesByCode(employeeCode);
    if (!profile) {
      appLogger.error(
        `FATAL: User Code ${req.user!.user_code} has no linked Employee profile.`
      );
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Profil pegawai tidak ditemukan.",
        404
      );
    }

    const { type_code, start_date, end_date, reason } = validation.data;

    // Calculate total work days
    const totalWorkDays = calculateWorkdays(start_date, end_date);
    if (totalWorkDays === 0) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "Permintaan cuti harus mencakup setidaknya satu hari kerja.",
        400
      );
    }

    // Check Leave Balance (Crucial Integrity Check)
    const availableBalance = await getLeaveBalanceByEmployeeAndType(
      employeeCode,
      type_code
    );
    if (!availableBalance) {
      return errorResponse(
        res,
        API_STATUS.CONFLICT,
        "Anda belum memiliki alokasi saldo untuk tipe cuti yang diminta ini.",
        409
      );
    }

    if (availableBalance.balance < totalWorkDays) {
      return errorResponse(
        res,
        API_STATUS.CONFLICT,
        `Sisa cuti Anda (${availableBalance.balance} hari) tidak mencukupi untuk ${totalWorkDays} hari yang diminta.`,
        409
      );
    }

    const leaveRequestData = {
      employee_code: employeeCode,
      type_code,
      start_date,
      total_days: totalWorkDays,
      end_date,
      reason,
    };
    const newRequest = await addLeaveRequests(leaveRequestData);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Pengajuan cuti berhasil dikirim dan menunggu persetujuan Admin.",
      newRequest,
      201,
      RESPONSE_DATA_KEYS.LEAVE_REQUESTS
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    if (dbError.code === "ER_DUP_ENTRY" || dbError.errno === 1062) {
      const errorMessage = dbError.sqlMessage || dbError.message;
      const validationErrors = [];

      // --- Duplicate Request CODE ---
      if (
        errorMessage &&
        (errorMessage.includes("request_code") ||
          errorMessage.includes("uni_request_code"))
      ) {
        validationErrors.push({
          field: "request",
          message: "Kode Permintaan cuti yang dimasukkan sudah ada.",
        });

        // --- Send Duplicate Entry Response if any unique field failed ---
        if (validationErrors.length > 0) {
          appLogger.warn(
            "Employee creation failed: Duplicate entry detected for unique field(s)."
          );
          return errorResponse(
            res,
            API_STATUS.BAD_REQUEST,
            "Validasi gagal",
            400,
            validationErrors
          );
        }
      }

      appLogger.error(
        `Error submitting leave request for employee ${employeeCode}:${error}`
      );
      return errorResponse(
        res,
        API_STATUS.FAILED,
        "Terjadi kesalahan pada server saat pengajuan cuti.",
        500
      );
    }
  }
};
