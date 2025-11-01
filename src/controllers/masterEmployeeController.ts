import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response.js";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import {
  addMasterEmployees,
  editMasterEmployees,
  getAllMasterEmployees,
  getMasterEmployeesById,
  removeMasterEmployees,
} from "@models/masterEmployeeModel.js";
import { appLogger } from "@utils/logger.js";
import {
  addMasterEmployeesSchema,
  updateMasterEmployeesSchema,
} from "@schemas/masterEmployeeSchema.js";
import { DatabaseError } from "types/errorTypes.js";

/**
 * [GET] /master-employees - Fetch all Employees
 */
export const fetchAllMasterEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await getAllMasterEmployees();

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Karyawan berhasil di dapatkan",
      employees,
      200,
      RESPONSE_DATA_KEYS.EMPLOYEES
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching employees:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [GET] /master-employees/:id - Fetch Employee by id
 */
export const fetchMasterEmployeesById = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID Karyawan tidak valid.",
        400
      );
    }

    const employees = await getMasterEmployeesById(id);

    if (!employees) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Karyawan tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Karyawan berhasil didapatkan",
      employees,
      200,
      RESPONSE_DATA_KEYS.EMPLOYEES
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching employees:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [POST] /master-employees - Create a new Employee
 */
export const createMasterEmployees = async (req: Request, res: Response) => {
  try {
    const validation = addMasterEmployeesSchema.safeParse(req.body);

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

    const {
      first_name,
      last_name,
      join_date,
      position_id,
      address,
      contact_phone,
    } = validation.data;
    const masterEmployees = await addMasterEmployees({
      first_name,
      last_name,
      join_date,
      position_id,
      address,
      contact_phone,
    });

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data master karyawan berhasil dibuat",
      masterEmployees,
      201,
      RESPONSE_DATA_KEYS.EMPLOYEES
    );
  } catch (error) {
    const dbError = error as unknown;
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
 * [PUT] /master-employees/:id - Edit a Employee
 */
export const updateMasterEmployees = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID karyawan tidak valid.",
        400
      );
    }

    // Validate request body
    const validation = updateMasterEmployeesSchema.safeParse(req.body);
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
    const { first_name, last_name, address, contact_phone, position_id } =
      validatedData;

    const masterEmployees = await editMasterEmployees({
      id,
      first_name,
      last_name,
      address,
      contact_phone,
      position_id,
    });

    // Validate employee not found
    if (!masterEmployees) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Karyawan tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data master karyawan berhasil diperbarui",
      masterEmployees,
      200,
      RESPONSE_DATA_KEYS.EMPLOYEES
    );
  } catch (error) {
    appLogger.error(`Error editing employees:${error}`);

    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [DELETE] /master-employees/:id - Delete a Employee
 */
export const destroyMasterEmployees = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID karyawan tidak valid.",
        400
      );
    }

    const existing = await getMasterEmployeesById(id);

    if (!existing) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Karyawan tidak ditemukan",
        404
      );
    }

    await removeMasterEmployees(existing.id);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data master karyawan berhasil dihapus",
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
        `Failed to delete employee ID ${req.params.id} due to constraint.`
      );
      return errorResponse(
        res,
        API_STATUS.CONFLICT,
        "Tidak dapat menghapus karyawan karena masih digunakan oleh Posisi lain.",
        409
      );
    }

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
