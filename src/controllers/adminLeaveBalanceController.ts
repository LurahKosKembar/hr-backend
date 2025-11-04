import { Request, Response } from "express";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import { appLogger } from "@utils/logger.js";
import { errorResponse, successResponse } from "@utils/response.js";
import { DatabaseError } from "types/errorTypes.js";
import {
  bulkGrantLeaveBalances,
  getAllLeaveBalanceReport,
  removeBulkLeaveBalances,
  setSpecificLeaveBalance,
} from "@models/leaveBalanceModel.js";
import {
  addLeaveBalanceSchema,
  updateLeaveBalanceSchema,
} from "@schemas/leaveBalanceSchema.js";

/**
 * [POST] /leave-balances/ - create or increments the leave balance for all employees
 */
export const bulkGrantLeaveBalancesController = async (
  req: Request,
  res: Response
) => {
  try {
    // 1. Validation
    const validation = addLeaveBalanceSchema.safeParse(req.body);
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

    const { leave_type_id, amount, year } = validation.data;

    // 2. Execute Bulk Grant (Upsert logic in model)
    const affectedCount = await bulkGrantLeaveBalances({
      leave_type_id,
      amount,
      year,
    });

    if (affectedCount === 0) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Tidak ada pegawai aktif yang ditemukan untuk diberikan saldo cuti.",
        404
      );
    }

    // 3. Success Response
    return successResponse(
      res,
      API_STATUS.SUCCESS,
      `Berhasil memperbarui atau menambahkan saldo cuti untuk ${affectedCount} pegawai.`,
      { affected_count: affectedCount }, // Return the count as clear context
      201,
      RESPONSE_DATA_KEYS.LEAVE_BALANCES
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    // CRITICAL: Handle Foreign Key Constraint (Invalid leave_type_id or non-existent employee)
    if (
      dbError.code === "ER_NO_REFERENCED_ROW" ||
      dbError.errno === 1452 ||
      (dbError.message &&
        dbError.message.includes("a foreign key constraint fails"))
    ) {
      appLogger.warn("Bulk grant failed due to invalid foreign key.");
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID Tipe Cuti tidak valid. Saldo tidak dapat diberikan.",
        400
      );
    }

    appLogger.error(`Error during bulk grant leave balances: ${error}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server.",
      500
    );
  }
};

/**
 * [PUT] /leave-balances/:employeeId - set or overwrite leave balance for single employee
 */
export const setSpecificLeaveBalanceController = async (
  req: Request,
  res: Response
) => {
  try {
    // 1. Validate ID Parameter
    const employeeId: number = parseInt(req.params.employeeId, 10);
    if (isNaN(employeeId)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID pegawai tidak valid.",
        400
      );
    }

    // 2. Validate Request Body
    const validation = updateLeaveBalanceSchema.safeParse(req.body);
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
    const { leave_type_id, amount, year } = validation.data;

    // 3. Execute Set Balance (Upsert logic in model)
    const updatedBalance = await setSpecificLeaveBalance({
      employee_id: employeeId,
      leave_type_id,
      amount,
      year,
    });

    if (!updatedBalance) {
      // This generally means the employeeId/leave_type_id combination failed the FK check
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Pegawai atau Tipe Cuti tidak ditemukan.",
        404
      );
    }

    // 4. Success Response
    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Saldo cuti pegawai berhasil diperbarui.",
      updatedBalance,
      200,
      RESPONSE_DATA_KEYS.LEAVE_BALANCES
    );
  } catch (error) {
    // Handle unique constraint failure or other DB errors
    const dbError = error as DatabaseError;

    // Handle FK errors (e.g., non-existent employee_id or leave_type_id)
    if (
      dbError.code === "ER_NO_REFERENCED_ROW" ||
      dbError.errno === 1452 ||
      dbError.message.includes("foreign key")
    ) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID Pegawai atau Tipe Cuti tidak valid.",
        400
      );
    }

    appLogger.error(`Error setting specific leave balance: ${error}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server.",
      500
    );
  }
};
/**
 * [DELETE] /leave-balances/bulk - delete all leave balance records matching specific type and year
 */
export const bulkDeleteLeaveBalancesController = async (
  req: Request,
  res: Response
) => {
  try {
    // 1. Get parameters from QUERY STRING
    const { leave_type_id, year } = req.query;

    // 2. Validation (Query parameters are strings, so we validate their presence and parse them)
    if (!leave_type_id || !year) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "Parameter 'leave_type_id' dan 'year' wajib diisi.",
        400
      );
    }

    const leaveTypeId = parseInt(leave_type_id as string, 10);
    const targetYear = parseInt(year as string, 10);

    if (isNaN(leaveTypeId) || isNaN(targetYear)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "Nilai ID Tipe Cuti dan Tahun harus berupa angka.",
        400
      );
    }

    // 3. Execute Bulk Delete
    const deletedCount = await removeBulkLeaveBalances(leaveTypeId, targetYear);

    // 4. Response
    if (deletedCount === 0) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        `Tidak ada saldo cuti ditemukan untuk Tipe Cuti ID ${leaveTypeId} pada tahun ${targetYear}.`,
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      `${deletedCount} saldo cuti berhasil dihapus.`,
      null,
      200,
      RESPONSE_DATA_KEYS.LEAVE_BALANCES
    );
  } catch (error) {
    appLogger.error(`Error deleting bulk leave balances:${error}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server.",
      500
    );
  }
};

/**
 * [GET] /api/v1/admin/leave-balances - Fetch Comprehensive Leave Balance Report
 * Retrieves all leave balances, joined with employee, position, and department data.
 */
export const fetchAllLeaveBalanceReport = async (
  req: Request,
  res: Response
) => {
  try {
    // 1. Fetch the comprehensive joined data from the model
    // We assume the model handles any necessary filtering (e.g., by current year)
    const reportData = await getAllLeaveBalanceReport();

    // 3. Success Response
    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Laporan saldo cuti berhasil didapatkan.",
      reportData,
      200,
      RESPONSE_DATA_KEYS.LEAVE_BALANCES // Using a plural key for the list
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    // Log the detailed database error
    appLogger.error(`Error fetching full leave balance report: ${dbError}`);

    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server saat membuat laporan saldo cuti.",
      500
    );
  }
};
