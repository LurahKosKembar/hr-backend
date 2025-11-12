import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response.js";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import {
  addMasterLeaveTypes,
  editMasterLeaveTypes,
  getAllMasterLeaveTypes,
  getMasterLeaveTypesById,
  removeMasterLeaveTypes,
} from "@models/masterLeaveTypeModel.js";
import { appLogger } from "@utils/logger.js";
import {
  addMasterLeaveTypesSchema,
  updateMasterLeaveTypesSchema,
} from "@schemas/masterLeaveTypeSchema.js";
import { DatabaseError } from "types/errorTypes.js";

/**
 * [GET] /master-leave-types - Fetch all Leave Type
 */
export const fetchAllMasterLeaveTypes = async (req: Request, res: Response) => {
  try {
    const leaveTypes = await getAllMasterLeaveTypes();

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Tipe Cuti berhasil di dapatkan",
      leaveTypes,
      200,
      RESPONSE_DATA_KEYS.LEAVE_TYPES
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching leave types:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [GET] /master-leave-types/:id - Fetch Leave Type by id
 */
export const fetchMasterLeaveTypesById = async (
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
        "ID Tipe Cuti tidak valid.",
        400
      );
    }

    const leaveTypes = await getMasterLeaveTypesById(id);

    if (!leaveTypes) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Tipe Cuti tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Tipe Cuti berhasil didapatkan",
      leaveTypes,
      200,
      RESPONSE_DATA_KEYS.LEAVE_TYPES
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching leave types:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [POST] /master-leave-types - Create a new leave types
 */
export const createMasterLeaveTypes = async (req: Request, res: Response) => {
  try {
    const validation = addMasterLeaveTypesSchema.safeParse(req.body);

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

    const leaveTypeData = validation.data;
    const masterLeaveTypes = await addMasterLeaveTypes(leaveTypeData);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data master tipe cuti berhasil dibuat",
      masterLeaveTypes,
      201,
      RESPONSE_DATA_KEYS.LEAVE_TYPES
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    if (dbError.code === "ER_DUP_ENTRY" || dbError.errno === 1062) {
      const errorMessage = dbError.sqlMessage || dbError.message;
      const validationErrors = [];

      // --- Duplicate Leave Type CODE ---
      if (
        errorMessage &&
        (errorMessage.includes("type_code") ||
          errorMessage.includes("uni_type_code"))
      ) {
        validationErrors.push({
          field: "type",
          message: "Kode tipe cuti yang dimasukkan sudah ada.",
        });
      }
    }

    appLogger.error(`Error creating leave types:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [PUT] /master-leave-types/:id - Edit a Leave Type
 */
export const updateMasterLeaveTypes = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID tipe cuti tidak valid.",
        400
      );
    }

    // Validate request body
    const validation = updateMasterLeaveTypesSchema.safeParse(req.body);
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

    const leaveTypeData = validation.data;
    const masterLeaveTypes = await editMasterLeaveTypes({
      id,
      ...leaveTypeData,
    });

    // Validate leave type not found
    if (!masterLeaveTypes) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Tipe Cuti tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Tipe Cuti berhasil diperbarui",
      masterLeaveTypes,
      200,
      RESPONSE_DATA_KEYS.LEAVE_TYPES
    );
  } catch (error) {
    appLogger.error(`Error editing leave types:${error}`);

    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [DELETE] /master-leave-types/:id - Delete a Leave Types
 */
export const destroyMasterLeaveTypes = async (req: Request, res: Response) => {
  try {
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID tipe cuti tidak valid.",
        400
      );
    }

    const existing = await getMasterLeaveTypesById(id);

    if (!existing) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data master tipe cuti tidak ditemukan",
        404
      );
    }

    await removeMasterLeaveTypes(existing.id);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data master tipe cuti berhasil dihapus",
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
        `Failed to delete leave type ID ${req.params.id} due to constraint.`
      );
      return errorResponse(
        res,
        API_STATUS.CONFLICT,
        "Tidak dapat menghapus tipe cuti karena masih digunakan oleh tabel lain.",
        409
      );
    }

    // Catch-all for other server errors
    appLogger.error(`Error editing leave types:${error}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};
