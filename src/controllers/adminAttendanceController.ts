import { Request, Response } from "express";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import { getAllAttendances } from "@models/attendanceModel.js";
import { errorResponse, successResponse } from "@utils/response.js";
import { appLogger } from "@utils/logger.js";

/**
 * [GET] /attendances/ - Fetch all employee attendances
 */
export const fetchAllAttendances = async (req: Request, res: Response) => {
  try {
    const attendances = await getAllAttendances();

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data absensi berhasil di dapatkan",
      attendances,
      200,
      RESPONSE_DATA_KEYS.ATTENDANCES
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
