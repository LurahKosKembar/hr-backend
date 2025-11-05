import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response.js";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import {
  addMasterPositions,
  editMasterPositions,
  getAllMasterPositions,
  getMasterPositionsById,
  removeMasterPositions,
} from "@models/masterPositionModel.js";
import { appLogger } from "@utils/logger.js";
import {
  addMasterPositionsSchema,
  updateMasterPositionsSchema,
} from "@schemas/masterPositionSchema.js";
import { DatabaseError } from "types/errorTypes.js";

/**
 * [GET] /master-positions - Fetch all Positions
 */
export const fetchAllMasterPositions = async (req: Request, res: Response) => {
  try {
    const positions = await getAllMasterPositions();

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Posisi berhasil di dapatkan",
      positions,
      200,
      RESPONSE_DATA_KEYS.POSITIONS
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching positions:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [GET] /master-positions/:id - Fetch Position by id
 */
export const fetchMasterPositionsById = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID posisi tidak valid.",
        400
      );
    }

    const positions = await getMasterPositionsById(id);

    if (!positions) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Posisi tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Posisi berhasil didapatkan",
      positions,
      200,
      RESPONSE_DATA_KEYS.POSITIONS
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching positions:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [POST] /master-positions - Create a new Position
 */
export const createMasterPositions = async (req: Request, res: Response) => {
  try {
    const validation = addMasterPositionsSchema.safeParse(req.body);

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

    const { name, department_id, base_salary, position_code } = validation.data;
    const masterPositions = await addMasterPositions({
      name,
      department_id,
      base_salary,
      position_code,
    });

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data master posisi berhasil dibuat",
      masterPositions,
      201,
      RESPONSE_DATA_KEYS.POSITIONS
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    if (
      dbError.code === "ER_NO_REFERENCED_ROW" ||
      dbError.errno === 1452 ||
      (dbError.message &&
        dbError.message.includes("a foreign key constraint fails"))
    ) {
      appLogger.warn("Creation failed: Invalid department ID provided.");
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID Departemen tidak ditemukan. Pastikan ID Departemen yang digunakan valid.",
        400
      );
    }

    if (dbError.code === "ER_DUP_ENTRY" || dbError.errno === 1062) {
      const errorMessage = dbError.sqlMessage || dbError.message;

      // 1. Check for Duplicate Position CODE
      if (
        errorMessage &&
        (errorMessage.includes("position_code") ||
          errorMessage.includes("uni_position_code"))
      ) {
        appLogger.warn(
          "Position creation failed: Duplicate department code entry."
        );
        return errorResponse(
          res,
          API_STATUS.BAD_REQUEST,
          "Validasi gagal",
          400,
          [
            {
              field: "name",
              message: "Kode posisi yang dimasukkan sudah ada.",
            },
          ]
        );
      }

      if (
        errorMessage &&
        (errorMessage.includes("name") || errorMessage.includes("uni_name"))
      ) {
        appLogger.warn("Position creation failed: Duplicate name entry.");
        return errorResponse(
          res,
          API_STATUS.BAD_REQUEST,
          "Validasi gagal",
          400,
          [
            {
              field: "name",
              message: "Nama posisi yang dimasukkan sudah ada.",
            },
          ]
        );
      }

      if (
        errorMessage &&
        (errorMessage.includes("name") || errorMessage.includes("uni_name"))
      ) {
        appLogger.warn("Position creation failed: Duplicate name entry.");
        return errorResponse(
          res,
          API_STATUS.BAD_REQUEST,
          "Validasi gagal",
          400,
          [
            {
              field: "name",
              message: "Nama posisi yang dimasukkan sudah ada.",
            },
          ]
        );
      }
    }

    appLogger.error(`Error creating positions:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [PUT] /master-positions/:id - Edit a Position
 */
export const updateMasterPositions = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID posisi tidak valid.",
        400
      );
    }

    // Validate request body
    const validation = updateMasterPositionsSchema.safeParse(req.body);
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
    const { name, department_id, base_salary, position_code } = validatedData;

    const masterPositions = await editMasterPositions({
      id,
      name,
      position_code,
      base_salary,
      department_id,
    });

    // Validate position not found
    if (!masterPositions) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Posisi tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data master posisi berhasil diperbarui",
      masterPositions,
      200,
      RESPONSE_DATA_KEYS.POSITIONS
    );
  } catch (error) {
    appLogger.error(`Error editing positions:${error}`);

    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [DELETE] /master-positions/:id - Delete a Position
 */
export const destroyMasterPositions = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID posisi tidak valid.",
        400
      );
    }

    const existing = await getMasterPositionsById(id);

    if (!existing) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Posisi tidak ditemukan",
        404
      );
    }

    await removeMasterPositions(existing.id);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data master posisi berhasil dihapus",
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
        `Failed to delete position ID ${req.params.id} due to constraint.`
      );
      return errorResponse(
        res,
        API_STATUS.CONFLICT,
        "Tidak dapat menghapus posisi karena masih digunakan oleh pegawai lain.",
        409
      );
    }

    if (dbError.code === "ER_DUP_ENTRY" || dbError.errno === 1062) {
      const errorMessage = dbError.sqlMessage || dbError.message;

      // 1. Check for Duplicate Position CODE
      if (
        errorMessage &&
        (errorMessage.includes("position_code") ||
          errorMessage.includes("uni_position_code"))
      ) {
        appLogger.warn(
          "Position creation failed: Duplicate position code entry."
        );
        return errorResponse(
          res,
          API_STATUS.BAD_REQUEST,
          "Kode posisi yang dimasukkan sudah ada. Gunakan kode lain.",
          400
        );
      }
    }

    // Catch-all for other server errors
    appLogger.error(`Error editing positions:${error}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};
