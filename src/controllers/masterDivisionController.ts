import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response.js";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import { appLogger } from "@utils/logger.js";
import { DatabaseError } from "types/errorTypes.js";
import {
  addMasterDivisions,
  editMasterDivisions,
  getAllMasterDivision,
  getMasterDivisionsById,
  removeMasterDivision,
} from "@models/masterDivisionModel.js";
import {
  addMasterDivisionsSchema,
  updateMasterDivisionsSchema,
} from "@schemas/masterDivisionSchema.js";

/**
 * [GET] /master-divisions - Fetch all Divisions
 */
export const fetchAllMasterDivisions = async (req: Request, res: Response) => {
  try {
    const divisions = await getAllMasterDivision();

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Divisi berhasil di dapatkan",
      divisions,
      200,
      RESPONSE_DATA_KEYS.DIVISIONS
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching divisions:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [GET] /master-divisions/:id - Fetch Division by id
 */
export const fetchMasterDivisionsById = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID divisi tidak valid.",
        400
      );
    }

    const divisions = await getMasterDivisionsById(id);

    if (!divisions) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Divisi tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Divisi berhasil didapatkan",
      divisions,
      200,
      RESPONSE_DATA_KEYS.DIVISIONS
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching divisions:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [POST] /master-divisions - Create a new Division
 */
export const createMasterDivisions = async (req: Request, res: Response) => {
  try {
    const validation = addMasterDivisionsSchema.safeParse(req.body);

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

    const { name, department_code, description } = validation.data;
    const masterDivisions = await addMasterDivisions({
      name,
      department_code,
      description,
    });

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data master divisi berhasil dibuat",
      masterDivisions,
      201,
      RESPONSE_DATA_KEYS.DIVISIONS
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    if (dbError.code === "ER_DUP_ENTRY" || dbError.errno === 1062) {
      const errorMessage = dbError.sqlMessage || dbError.message;

      // Check for Duplicate Division CODE
      if (
        errorMessage &&
        (errorMessage.includes("division_code") ||
          errorMessage.includes("uni_division_code"))
      ) {
        appLogger.warn(
          "Department creation failed: Duplicate division code entry."
        );
        return errorResponse(
          res,
          API_STATUS.BAD_REQUEST,
          "Validasi gagal",
          400,
          [
            {
              field: "name",
              message: "Kode divisi yang dimasukkan sudah ada.",
            },
          ]
        );
      }
    }

    //  Check if the department code exist or not
    if (dbError.code === "ER_NO_REFERENCED_ROW_2" || dbError.errno === 1452) {
      appLogger.warn(
        "Division creation failed: department_code does not exist."
      );

      return errorResponse(res, API_STATUS.BAD_REQUEST, "Validasi gagal", 400, [
        {
          field: "department_code",
          message: "Kode departemen tidak ditemukan.",
        },
      ]);
    }

    appLogger.error(`Error creating divisions:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [PUT] /master-divisions/:id - Edit a Division
 */
export const updateMasterDivisions = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID divisi tidak valid.",
        400
      );
    }

    // Validate request body
    const validation = updateMasterDivisionsSchema.safeParse(req.body);
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
    const { name, department_code, description } = validatedData;

    const masterDivisions = await editMasterDivisions({
      id,
      name,
      department_code,
      description,
    });

    // Validate department not found
    if (!masterDivisions) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Divisi tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data master divisi berhasil diperbarui",
      masterDivisions,
      200,
      RESPONSE_DATA_KEYS.DIVISIONS
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    //  Check if the department code exist or not
    if (dbError.code === "ER_NO_REFERENCED_ROW_2" || dbError.errno === 1452) {
      appLogger.warn(
        "Division creation failed: department_code does not exist."
      );

      return errorResponse(res, API_STATUS.BAD_REQUEST, "Validasi gagal", 400, [
        {
          field: "department_code",
          message: "Kode departemen tidak ditemukan.",
        },
      ]);
    }

    appLogger.error(`Error editing divisions:${error}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [DELETE] /master-divisions/:id - Delete a Division
 */
export const destroyMasterDivisions = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID divisi tidak valid.",
        400
      );
    }

    const existing = await getMasterDivisionsById(id);

    if (!existing) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Divisi tidak ditemukan",
        404
      );
    }

    await removeMasterDivision(existing.id);

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
        "Tidak dapat menghapus divisi karena masih digunakan oleh Posisi lain.",
        409
      );
    }

    // Catch-all for other server errors
    appLogger.error(`Error editing divisions:${error}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};
