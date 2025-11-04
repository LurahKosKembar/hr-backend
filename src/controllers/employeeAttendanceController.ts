import { Response } from "express";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import { checkInSchema, checkOutSchema } from "@schemas/attendanceSchema.js";
import { errorResponse, successResponse } from "@utils/response.js";
import {
  getEmployeeAttendances,
  recordCheckIn,
  recordCheckOut,
} from "@models/attendanceModel.js";
import { AuthenticatedRequest } from "@middleware/jwt.js";
import { getMasterEmployeesById } from "@models/masterEmployeeModel.js";
import { appLogger } from "@utils/logger.js";
import { formatDate } from "@utils/formatDate.js";
import { DatabaseError } from "types/errorTypes.js";

/**
 * [POST] /attendances/check-in - Record Employee Check-In
 */
export const checkIn = async (req: AuthenticatedRequest, res: Response) => {
  const employeeId = req.user!.employee_id;

  try {
    // validate the request first
    const validation = checkInSchema.safeParse(req.body);
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

    // check if the employee exist or not in database
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

    // save the check out data to database
    const workDate = formatDate();
    const time = new Date();
    const checkInData = await recordCheckIn({
      employee_id: employeeId,
      check_in_time: time,
      work_date: workDate,
    });

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      `Berhasil check-in, Selamat bekerja ${profile!.first_name} ${profile!.last_name}`,
      checkInData,
      201,
      RESPONSE_DATA_KEYS.ATTENDANCES
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    if (dbError.code === "ER_DUP_ENTRY" || dbError.errno === 1062) {
      appLogger.warn(`Employee ${employeeId} attempted duplicate check-in.`);
      return errorResponse(
        res,
        API_STATUS.FAILED,
        "Anda sudah melakukan check-in hari ini. Tidak dapat check-in ganda.",
        409
      );
    }

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
 * [PUT] /attendances/check-out - Record Employee Check-Out
 */
export const checkOut = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // validate the request first
    const validation = checkOutSchema.safeParse(req.body);
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

    // check if the employee exist or not in database
    const employeeId = req.user!.employee_id;
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

    // save the check out data to database
    const workDate = formatDate();
    const time = new Date();
    const checkOutData = await recordCheckOut({
      check_out_time: time,
      employee_id: employeeId,
      work_date: workDate,
    });

    if (!checkOutData) {
      appLogger.warn(
        `Employee ${employeeId} attempted check-out, but no open record was found (Possible duplicate check-out).`
      );
      return errorResponse(
        res,
        API_STATUS.CONFLICT,
        "Anda belum check-in hari ini atau sudah melakukan check-out sebelumnya.",
        409
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      `Berhasil check-out, Selamat beristirahat ${profile!.first_name} ${profile!.last_name}`,
      checkOutData,
      200,
      RESPONSE_DATA_KEYS.ATTENDANCES
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
 * [GET] /attendances/ - Fetch current employee attendance
 */
export const fetchEmployeeAttendance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const employeeId = req.user!.employee_id;
    const departments = await getEmployeeAttendances(employeeId);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Absensi berhasil didapatkan",
      departments,
      200,
      RESPONSE_DATA_KEYS.ATTENDANCES
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching attendance:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};
