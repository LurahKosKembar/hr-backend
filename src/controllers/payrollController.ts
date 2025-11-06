import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response.js";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import { appLogger } from "@utils/logger.js";
import { DatabaseError } from "types/errorTypes.js";
import {
  generatePayrollSchema,
  updateSpecificPayrollSchema,
} from "@schemas/payrollSchema.js";
import {
  bulkGeneratePayrolls,
  editPayroll,
  getAllPayrolls,
  getPayrollById,
  removePayroll,
} from "@models/payrollsModel.js";

/**
 * [POST] /payroll/generate - Generate payrolls for all employees
 */
export const generateAllPayroll = async (req: Request, res: Response) => {
  try {
    const validation = generatePayrollSchema.safeParse(req.body);

    if (!validation.success) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "Validasi gagal",
        400,
        validation.error.errors.map((err) => ({
          field: err.path?.[0] ?? "unknown",
          message: err.message,
        }))
      );
    }

    const { payroll_period_id } = validation.data;

    // Execute the bulk payroll generation
    const processedCount = await bulkGeneratePayrolls(payroll_period_id);

    if (processedCount === 0) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Tidak ada pegawai aktif yang ditemukan untuk dibuatkan gaji.",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      `Berhasil menghasilkan atau memperbarui data payroll untuk ${processedCount} pegawai.`,
      { affected_count: processedCount },
      201,
      RESPONSE_DATA_KEYS.PAYROLLS
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    // Handle invalid foreign key (nonexistent payroll_period_id)
    if (
      dbError.code === "ER_NO_REFERENCED_ROW" ||
      dbError.errno === 1452 ||
      (dbError.message &&
        dbError.message.includes("a foreign key constraint fails"))
    ) {
      appLogger.warn(
        `Bulk generate payroll gagal: Payroll period tidak ditemukan (${dbError.message})`
      );
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID periode payroll tidak valid. Payroll tidak dapat digenerate.",
        400
      );
    }

    // Optional: Handle duplicate payroll generation
    if (dbError.code === "ER_DUP_ENTRY" || dbError.errno === 1062) {
      appLogger.warn("Payroll sudah dihasilkan sebelumnya untuk periode ini.");
      return errorResponse(
        res,
        API_STATUS.CONFLICT,
        "Payroll untuk periode ini sudah pernah digenerate.",
        409
      );
    }

    appLogger.error(`Error during bulk generate payroll: ${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server.",
      500
    );
  }
};

/**
 * [GET] /payroll - Fetch all payroll
 */
export const fetchAllPayrolls = async (req: Request, res: Response) => {
  try {
    const payrolls = await getAllPayrolls();

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Payroll berhasil di dapatkan",
      payrolls,
      200,
      RESPONSE_DATA_KEYS.PAYROLLS
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching payrolls:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [GET] /payrolls/:id - Fetch Payrolls by id
 */
export const fetchPayrollsById = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID Payroll tidak valid.",
        400
      );
    }

    const payrolls = await getPayrollById(id);

    if (!payrolls) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Payroll tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Payroll berhasil didapatkan",
      payrolls,
      200,
      RESPONSE_DATA_KEYS.PAYROLLS
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching payrolls:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [PUT] /payroll/:id - Edit a specific Payroll if still in draft status
 */
export const updatePayroll = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID payroll tidak valid.",
        400
      );
    }

    // Validate request body
    const validation = updateSpecificPayrollSchema.safeParse(req.body);
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

    const validatedData = validation.data;
    const { status, total_deductions, base_salary } = validatedData;

    const existingPayroll = await getPayrollById(id);
    if (!existingPayroll) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data payroll tidak ditemukan",
        404
      );
    }

    if (existingPayroll.status !== "draft") {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "Hanya payroll dengan status draft yang dapat diperbarui.",
        400
      );
    }

    const payrolls = await editPayroll({
      id,
      status,
      total_deductions,
      base_salary,
      existingPayroll,
    });

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data payroll berhasil diperbarui",
      payrolls,
      200,
      RESPONSE_DATA_KEYS.PAYROLLS
    );
  } catch (error) {
    appLogger.error(`Error editing payroll:${error}`);

    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [DELETE] /payrolls/:id - Delete a Payroll that still in draft
 */
export const destroyPayrolls = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID payroll tidak valid.",
        400
      );
    }

    const existingPayroll = await getPayrollById(id);

    if (!existingPayroll) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Karyawan tidak ditemukan",
        404
      );
    }

    if (existingPayroll.status !== "draft") {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "Hanya payroll dengan status draft yang dapat dihapus.",
        400
      );
    }

    await removePayroll(existingPayroll.id);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data payroll berhasil dihapus",
      null,
      200
    );
  } catch (error) {
    // Catch-all for other server errors
    appLogger.error(`Error editing employees:${error}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};
