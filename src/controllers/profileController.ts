import { Response } from "express";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import { AuthenticatedRequest } from "@middleware/jwt.js";
import {
  editMasterEmployees,
  getMasterEmployeesById,
} from "@models/masterEmployeeModel.js";
import { appLogger } from "@utils/logger.js";
import { errorResponse, successResponse } from "@utils/response.js";
import { updateProfileSchema } from "@schemas/profileSchema.js";

/**
 * [GET] /profile - Fetch employee profile
 */
export const fetchEmployeeProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const employeeId = req.user!.employee_id;

  try {
    const profile = await getMasterEmployeesById(employeeId);

    if (!profile) {
      appLogger.error(
        `FATAL: User ID ${req.user!.id} has no linked Employee profile.`
      );
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Profil pegawai tidak ditemukan.",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data profil berhasil didapatkan.",
      profile,
      200,
      RESPONSE_DATA_KEYS.USERS // Assuming EMPLOYEE is the key for single profile data
    );
  } catch (error) {
    appLogger.error(
      `Error fetching profile for employee ${employeeId}: ${error}`
    );

    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server saat mengambil profil.",
      500
    );
  }
};

/**
 * [PUT] /profile - UPdate employee profile
 */
export const updateEmployeeProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const employeeId = req.user!.employee_id;

  try {
    const validation = updateProfileSchema.safeParse(req.body);

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

    const updatedProfile = await editMasterEmployees(
      employeeId,
      validation.data
    );

    if (!updatedProfile) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Profil pegawai tidak ditemukan untuk diperbarui.",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data profil berhasil diperbarui.",
      updatedProfile,
      200,
      RESPONSE_DATA_KEYS.USERS
    );
  } catch (error) {
    // We use the general error handler since validation (uniqueness) is not expected here
    appLogger.error(
      `Error fetching profile for employee ${employeeId}: ${error}`
    );

    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server saat memperbarui profil.",
      500
    );
  }
};
