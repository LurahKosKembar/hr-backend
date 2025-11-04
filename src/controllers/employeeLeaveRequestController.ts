import { Response } from "express";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import { errorResponse, successResponse } from "@utils/response.js";
import { appLogger } from "@utils/logger.js";
import { AuthenticatedRequest } from "@middleware/jwt.js";
import { addLeaveRequest } from "@models/leaveRequestModel.js";
import { DatabaseError } from "types/errorTypes.js";
import { findEmployeeBalance } from "@models/leaveBalanceModel.js";
import { calculateWorkdays } from "@utils/dateCalculations.js";
import { addLeaveRequestSchema } from "@schemas/leaveRequestSchema.js";

/**
 * [POST] /leave-requests - Submit a new leave application
 */
export const createLeaveRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  // 1. Get Employee ID from authenticated token
  const employeeId = req.user!.employee_id;

  try {
    // 2. Validate Request Body
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

    const { leave_type_id, start_date, end_date, reason } = validation.data;

    // 3. Calculate Total Workdays (Business Logic)
    const totalWorkDays = calculateWorkdays(start_date, end_date);

    // Fail if the total days is 0 (e.g., requested only Sunday)
    if (totalWorkDays === 0) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "Permintaan cuti harus mencakup setidaknya satu hari kerja.",
        400
      );
    }

    // 4. Check Leave Balance (Crucial Integrity Check)
    // Note: This model function needs to return the available balance for the given type/year
    const availableBalance = await findEmployeeBalance(
      employeeId,
      leave_type_id
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

    // 5. Submit Request (Model)
    const newRequest = await addLeaveRequest({
      employee_id: employeeId,
      leave_type_id,
      start_date,
      end_date,
      total_days: totalWorkDays,
      reason,
    });

    // 6. Success Response
    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Pengajuan cuti berhasil dikirim dan menunggu persetujuan Admin.",
      newRequest,
      201, // 201 Created
      RESPONSE_DATA_KEYS.LEAVE_REQUESTS // Assuming a key for leave requests
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    // Handle Foreign Key error if leave_type_id is invalid
    if (
      dbError.code === "ER_NO_REFERENCED_ROW" ||
      dbError.errno === 1452 ||
      dbError.message.includes("foreign key")
    ) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID Tipe Cuti tidak valid.",
        400
      );
    }

    appLogger.error(
      `Error submitting leave request for employee ${employeeId}:${error}`
    );
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server saat pengajuan cuti.",
      500
    );
  }
};
