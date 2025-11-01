import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response.js";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import {
  addMasterDepartments,
  editMasterDepartments,
  getAllMasterDepartments,
  getMasterDepartmentsById,
  removeMasterDepartments,
} from "@models/masterDepartmentModel.js";
import { appLogger } from "@utils/logger.js";
import {
  addMasterDepartmentsSchema,
  updateMasterDepartmentsSchema,
} from "@schemas/masterDepartmentSchema.js";
import { DatabaseError } from "types/errorTypes.js";

/**
 * [GET] /master-departments - Fetch all Departments
 */
export const fetchAllMasterDepartments = async (
  req: Request,
  res: Response
) => {
  try {
    const departments = await getAllMasterDepartments();

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Departemen berhasil di dapatkan",
      departments,
      200,
      RESPONSE_DATA_KEYS.DEPARTMENTS
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching departments:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [GET] /master-departments/:id - Fetch Department by id
 */
export const fetchMasterDepartmentsById = async (
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
        "ID departemen tidak valid.",
        400
      );
    }

    const departments = await getMasterDepartmentsById(id);

    if (!departments) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Departemen tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Departemen berhasil didapatkan",
      departments,
      200,
      RESPONSE_DATA_KEYS.DEPARTMENTS
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching departments:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [POST] /master-departments - Create a new Department
 */
export const createMasterDepartments = async (req: Request, res: Response) => {
  try {
    const validation = addMasterDepartmentsSchema.safeParse(req.body);

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

    const { name } = validation.data;
    const masterDepartments = await addMasterDepartments({ name });

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data master departemen berhasil dibuat",
      masterDepartments,
      201,
      RESPONSE_DATA_KEYS.DEPARTMENTS
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error creating departments:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [PUT] /master-departments/:id - Edit a Department
 */
export const updateMasterDepartments = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID departemen tidak valid.",
        400
      );
    }

    // Validate request body
    const validation = updateMasterDepartmentsSchema.safeParse(req.body);
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
    const { name } = validatedData;

    const masterDepartments = await editMasterDepartments({
      name,
      id,
    });

    // Validate department not found
    if (!masterDepartments) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Departemen tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data master departemen berhasil diperbarui",
      masterDepartments,
      200,
      RESPONSE_DATA_KEYS.DEPARTMENTS
    );
  } catch (error) {
    appLogger.error(`Error editing departments:${error}`);

    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [DELETE] /master-departments/:id - Delete a Department
 */
export const destroyMasterDepartments = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID departemen tidak valid.",
        400
      );
    }

    const existing = await getMasterDepartmentsById(id);

    if (!existing) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Departemen tidak ditemukan",
        404
      );
    }

    await removeMasterDepartments(existing.id);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data master departemen berhasil dihapus",
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
        `Failed to delete department ID ${req.params.id} due to constraint.`
      );
      return errorResponse(
        res,
        API_STATUS.CONFLICT,
        "Tidak dapat menghapus departemen karena masih digunakan oleh Posisi lain.",
        409
      );
    }

    // Catch-all for other server errors
    appLogger.error(`Error editing departments:${error}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};
