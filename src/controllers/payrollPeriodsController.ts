import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response.js";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import { appLogger } from "@utils/logger.js";
import { DatabaseError } from "types/errorTypes.js";
import {
  addPayrollPeriods,
  editStatusPayrollPeriods,
  getAllPayrollPeriods,
  getPayrollPeriodsById,
  removePayrollPeriods,
} from "@models/payrollPeriodsModel.js";
import {
  addPayrollPeriodsSchema,
  updatePayrollPeriodsStatusSchema,
} from "@schemas/payrollPeriodSchema.js";

/**
 * [GET] /payroll-periods - Fetch all payroll periods
 */
export const fetchAllPayrollPeriods = async (req: Request, res: Response) => {
  try {
    const payrollPeriods = await getAllPayrollPeriods();

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Periode Payroll berhasil di dapatkan",
      payrollPeriods,
      200,
      RESPONSE_DATA_KEYS.PAYROLL_PERIODS
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching payroll period:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [GET] /payroll-periods/:id - Fetch payroll period by id
 */
export const fetchPayrollPeriodsById = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID Period Payroll tidak valid.",
        400
      );
    }

    const payrollPeriods = await getPayrollPeriodsById(id);

    if (!payrollPeriods) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Periode Payroll tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Periode Payroll berhasil didapatkan",
      payrollPeriods,
      200,
      RESPONSE_DATA_KEYS.PAYROLL_PERIODS
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching periode payroll:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [POST] /payroll-periods - Create a new payroll period
 */
export const createPayrollPeriods = async (req: Request, res: Response) => {
  try {
    const validation = addPayrollPeriodsSchema.safeParse(req.body);

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

    const { period_code, start_date, end_date } = validation.data;

    const payrollPeriods = await addPayrollPeriods({
      period_code,
      start_date,
      end_date,
    });

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data periode payroll berhasil dibuat",
      payrollPeriods,
      201,
      RESPONSE_DATA_KEYS.PAYROLL_PERIODS
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    if (dbError.code === "ER_DUP_ENTRY" || dbError.errno === 1062) {
      const errorMessage = dbError.sqlMessage || dbError.message;

      // 1. Check for Duplicate payroll periods CODE
      if (
        errorMessage &&
        (errorMessage.includes("period_code") ||
          errorMessage.includes("uni_period_code"))
      ) {
        appLogger.warn(
          "Payroll Periode creation failed: Duplicate payroll period code entry."
        );
        return errorResponse(
          res,
          API_STATUS.BAD_REQUEST,
          "Validasi gagal",
          400,
          [
            {
              field: "name",
              message: "Kode period payroll yang dimasukkan sudah ada.",
            },
          ]
        );
      }

      // 2. Check for Duplicate start_date + end_date
      if (
        errorMessage &&
        (errorMessage.includes("start_date") ||
          errorMessage.includes("end_date"))
      ) {
        appLogger.warn(
          "Payroll Period creation failed: Duplicate start_date and end_date entry."
        );
        return errorResponse(
          res,
          API_STATUS.BAD_REQUEST,
          "Validasi gagal",
          400,
          [
            {
              field: "start_date",
              message:
                "Kombinasi tanggal mulai dan tanggal selesai periode payroll sudah digunakan.",
            },
          ]
        );
      }
    }

    appLogger.error(`Error creating payroll periods:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [PUT] /payroll-periods/:id/status - Update payroll period status
 */
export const updateStatusPayrollPeriods = async (
  req: Request,
  res: Response
) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID periode payroll tidak valid.",
        400
      );
    }

    // Validate request body
    const validation = updatePayrollPeriodsStatusSchema.safeParse(req.body);
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
    const { status } = validatedData;

    const payrollPeriods = await editStatusPayrollPeriods({
      id,
      status,
    });

    // Validate payroll periods not found
    if (!payrollPeriods) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data periode payroll tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Status periode payroll berhasil diperbarui",
      payrollPeriods,
      200,
      RESPONSE_DATA_KEYS.PAYROLL_PERIODS
    );
  } catch (error) {
    appLogger.error(`Error editing payrollPeriods:${error}`);

    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [DELETE] /payroll-periods/:id -  Delete a payroll periods
 */
export const destroyPayrollPeriods = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID period payroll tidak valid.",
        400
      );
    }

    const existing = await getPayrollPeriodsById(id);

    if (!existing) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Periode Payroll tidak ditemukan",
        404
      );
    }

    await removePayrollPeriods(existing.id);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data periode payroll berhasil dihapus",
      null,
      200
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    if (
      dbError.code === "ER_ROW_IS_REFERENCED" ||
      dbError.errno === 1451 ||
      (dbError.message &&
        dbError.message.includes("foreign key constraint fails"))
    ) {
      appLogger.warn(
        `Failed to delete payroll periods ID ${req.params.id} due to constraint.`
      );
      return errorResponse(
        res,
        API_STATUS.CONFLICT,
        "Tidak dapat menghapus periode payroll karena masih digunakan oleh Posisi lain.",
        409
      );
    }

    // Catch-all for other server errors
    appLogger.error(`Error editing payroll periods:${error}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};
