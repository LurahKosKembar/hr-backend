import { Request, Response } from "express";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import { appLogger } from "@utils/logger.js";
import { errorResponse, successResponse } from "@utils/response.js";
import { DatabaseError } from "types/errorTypes.js";
import {
  addBulkLeaveBalances,
  addLeaveBalances,
  editLeaveBalances,
  getAllLeaveBalances,
  getLeaveBalanceById,
  removeBulkLeaveBalances,
  removeLeaveBalances,
} from "@models/leaveBalanceModel.js";
import {
  addBulkLeaveBalanceSchema,
  addLeaveBalanceSchema,
  updateLeaveBalanceSchema,
} from "@schemas/leaveBalanceSchema.js";

/**
 * [GET] /leave-balances - Fetch all leave balances
 * Accepts optional query parameter: ?year=YYYY
 */
export const fetchAllLeaveBalances = async (req: Request, res: Response) => {
  try {
    // parsing year and type code
    const yearParam = req.query.year as string | undefined;
    const year = yearParam ? parseInt(yearParam, 10) : undefined;
    const typeCode = req.query.type_code as string | undefined;

    const leaveBalances = await getAllLeaveBalances(year, typeCode);
    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Saldo Cuti berhasil di dapatkan",
      leaveBalances,
      200,
      RESPONSE_DATA_KEYS.LEAVE_BALANCES
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching leave balances:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [GET] /leave-balances/:id - Fetch Leave Balance by id
 */
export const fetchLeaveBalanceById = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID Saldo Cuti tidak valid.",
        400
      );
    }

    const leaveBalances = await getLeaveBalanceById(id);

    if (!leaveBalances) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Saldo Cuti tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Saldo Cuti berhasil didapatkan",
      leaveBalances,
      200,
      RESPONSE_DATA_KEYS.LEAVE_BALANCES
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching leave balances:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [POST] /leave-balances - Create a new Leave Balance
 */
export const createLeaveBalances = async (req: Request, res: Response) => {
  try {
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

    const leaveBalanceData = validation.data;
    const leaveBalances = await addLeaveBalances(leaveBalanceData);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Saldo Cuti berhasil dibuat",
      leaveBalances,
      201,
      RESPONSE_DATA_KEYS.LEAVE_BALANCES
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    if (dbError.code === "ER_DUP_ENTRY" || dbError.errno === 1062) {
      const errorMessage = dbError.sqlMessage || dbError.message;
      const validationErrors = [];

      // --- Duplicate Leave Balance CODE ---
      if (
        errorMessage &&
        (errorMessage.includes("balance_code") ||
          errorMessage.includes("uni_balance_code"))
      ) {
        validationErrors.push({
          field: "balance_code",
          message: "Kode Saldo Cuti yang dimasukkan sudah ada.",
        });
      }

      // --- Duplicate Employee + Type + Year combination ---
      if (
        errorMessage &&
        errorMessage.includes(
          "leave_balances_employee_id_leave_type_id_year_unique"
        )
      ) {
        validationErrors.push({
          field: "employee_code",
          message:
            "Kombinasi Karyawan, Jenis Cuti, dan Tahun sudah memiliki saldo cuti.",
        });
      }

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

    //  Check if the employee code or type code exist or not
    if (dbError.code === "ER_NO_REFERENCED_ROW_2" || dbError.errno === 1452) {
      appLogger.warn(
        "Leave Balance operation failed: Foreign key (employee_code or type_code) does not exist."
      );

      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "Validasi gagal: Kode Karyawan atau Kode Jenis Cuti tidak ditemukan.", // <-- GENERIC MESSAGE
        400,
        []
      );
    }

    appLogger.error(`Error creating employees:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [POST] /leave-balances/bulk - create or increments the leave balance for all employees
 */
export const createBulkLeaveBalances = async (req: Request, res: Response) => {
  try {
    const validation = addBulkLeaveBalanceSchema.safeParse(req.body);
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

    const leaveBalanceData = validation.data;
    const affectedCount = await addBulkLeaveBalances(leaveBalanceData);

    if (affectedCount === 0) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Tidak ada pegawai aktif yang ditemukan untuk diberikan saldo cuti.",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      `Berhasil memperbarui atau menambahkan saldo cuti untuk ${affectedCount} pegawai.`,
      { affected_count: affectedCount },
      201,
      RESPONSE_DATA_KEYS.LEAVE_BALANCES
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    if (dbError.code === "ER_DUP_ENTRY" || dbError.errno === 1062) {
      const errorMessage = dbError.sqlMessage || dbError.message;
      const validationErrors = [];

      // --- Duplicate Leave Balance CODE ---
      if (
        errorMessage &&
        (errorMessage.includes("balance_code") ||
          errorMessage.includes("uni_balance_code"))
      ) {
        validationErrors.push({
          field: "balance_code",
          message: "Kode Saldo Cuti yang dimasukkan sudah ada.",
        });
      }

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

    //  Check if the employee code or type code exist or not
    if (dbError.code === "ER_NO_REFERENCED_ROW_2" || dbError.errno === 1452) {
      appLogger.warn(
        "Leave Balance operation failed: Foreign key (employee_code or type_code) does not exist."
      );

      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "Validasi gagal: Kode Karyawan atau Kode Jenis Cuti tidak ditemukan.",
        400,
        []
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
 * [PUT] /leave-balances/:id - Edit a Leave Balance
 */
export const updateLeaveBalances = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID Saldo Cuti tidak valid.",
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

    const leaveBalanceData = validation.data;
    const leaveBalances = await editLeaveBalances({ id, ...leaveBalanceData });

    if (!leaveBalances) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Saldo Cuti tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Saldo cuti berhasil diperbarui.",
      leaveBalances,
      200,
      RESPONSE_DATA_KEYS.LEAVE_BALANCES
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    if (dbError.code === "ER_DUP_ENTRY" || dbError.errno === 1062) {
      const errorMessage = dbError.sqlMessage || dbError.message;
      const validationErrors = [];

      // --- Duplicate Leave Balance CODE ---
      if (
        errorMessage &&
        (errorMessage.includes("balance_code") ||
          errorMessage.includes("uni_balance_code"))
      ) {
        validationErrors.push({
          field: "balance_code",
          message: "Kode Saldo Cuti yang dimasukkan sudah ada.",
        });
      }

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

    //  Check if the employee code or type code exist or not
    if (dbError.code === "ER_NO_REFERENCED_ROW_2" || dbError.errno === 1452) {
      appLogger.warn(
        "Leave Balance operation failed: Foreign key (employee_code or type_code) does not exist."
      );

      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "Validasi gagal: Kode Karyawan atau Kode Jenis Cuti tidak ditemukan.",
        400,
        []
      );
    }

    appLogger.error(`Error during editing leave balances: ${error}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server.",
      500
    );
  }
};

/**
 * [DELETE] /leave-balances/:id - Delete a leave balance
 */
export const destroyLeaveBalances = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID Saldo Cuti tidak valid.",
        400
      );
    }

    const existing = await getLeaveBalanceById(id);

    if (!existing) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Saldo Cuti tidak ditemukan",
        404
      );
    }

    await removeLeaveBalances(existing.id);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Saldo Cuti berhasil dihapus",
      null,
      200
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching leave balances:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [DELETE] /leave-balances/bulk - Delete all leave balance that have specific type code and year
 */
export const destroyBulkLeaveBalances = async (req: Request, res: Response) => {
  try {
    const yearParam = req.query.year as string | undefined;
    const year = yearParam ? parseInt(yearParam, 10) : undefined;
    const typeCode = req.query.type_code as string | undefined;

    if (!typeCode || !year) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "Parameter 'leave_type_id' dan 'year' wajib diisi.",
        400
      );
    }

    if (isNaN(year)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "Tahun harus berupa angka.",
        400
      );
    }

    const deletedCount = await removeBulkLeaveBalances(typeCode, year);

    if (deletedCount === 0) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        `Tidak ada saldo cuti ditemukan untuk Kode Tipe Cuti ${typeCode} pada tahun ${year}.`,
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
