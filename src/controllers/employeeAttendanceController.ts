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
import { getAttendanceSessionsByDate } from "@models/attendanceSessionModel.js";

/**
 * [POST] /attendances/check-in - Record Employee Check-In
 */
export const checkIn = async (req: AuthenticatedRequest, res: Response) => {
  // FIX: Because the relation is changed from id to employee code
  // We need to changed it too
  const employeeId = 2;

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

    // check if the attendance session exist or not
    const dateNow = formatDate();
    const attendanceSession = await getAttendanceSessionsByDate(dateNow);
    if (!attendanceSession) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Sesi absensi untuk sekarang belum ada. Coba lagi nanti",
        404
      );
    }

    // Compare current time with session open time
    const now = new Date();
    const openTime = new Date(`${dateNow}T${attendanceSession.open_time}`);
    if (now < openTime) {
      return errorResponse(
        res,
        API_STATUS.FAILED,
        "Sesi absensi untuk sekarang belum ada. Coba lagi nanti",
        403
      );
    }

    // check if the session is already closed
    if (attendanceSession.status === "closed") {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Sesi absensi untuk hari ini sudah ditutup.",
        403
      );
    }

    // Determine check-in status (late or in-time)
    const startTime = new Date(`${dateNow}T${attendanceSession.cutoff_time}`);
    const checkInStatus = now > startTime ? "late" : "in-time";

    // Record check-in data
    const checkInData = await recordCheckIn({
      employee_id: employeeId,
      session_id: attendanceSession.id,
      check_in_time: now,
      check_in_status: checkInStatus,
    });

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      `Berhasil check-in, Selamat bekerja ${profile!.full_name}`,
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
    // FIX: Because the relation is changed from id to employee code
    // We need to changed it too
    const employeeId = 2;
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

    // check if the attendance session exist or not
    const dateNow = formatDate();
    const attendanceSession = await getAttendanceSessionsByDate(dateNow);
    if (!attendanceSession) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Sesi absensi untuk sekarang belum ada. Coba lagi nanti",
        404
      );
    }

    // check if the session is already closed
    if (attendanceSession.status === "closed") {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Sesi absensi untuk hari ini sudah ditutup.",
        403
      );
    }

    // Determine check-out status (in-time, early, overtime)
    const now = new Date();
    const endTime = new Date(`${dateNow}T${attendanceSession.cutoff_time}`);
    const closeTime = new Date(`${dateNow}T${attendanceSession.close_time}`);

    let checkOutStatus: "early" | "in-time" | "overtime" | "missed" = "in-time";

    if (now < endTime) checkOutStatus = "early";
    else if (now > closeTime) checkOutStatus = "overtime";

    // save the check out data to database
    const checkOutData = await recordCheckOut({
      employee_id: employeeId,
      session_id: attendanceSession.id,
      check_out_time: now,
      check_out_status: checkOutStatus,
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
      `Berhasil check-out, Selamat beristirahat ${profile!.full_name}`,
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
    // FIX: Because the relation is changed from id to employee code
    // We need to changed it too
    const employeeId = 2;
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
