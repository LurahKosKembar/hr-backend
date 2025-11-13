import { Response, Request } from "express";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import { checkInSchema, checkOutSchema } from "@schemas/attendanceSchema.js";
import { errorResponse, successResponse } from "@utils/response.js";
import {
  getAttendanceById,
  getEmployeeAttendances,
  recordCheckIn,
  recordCheckOut,
} from "@models/attendanceModel.js";
import { AuthenticatedRequest } from "@middleware/jwt.js";
import { getMasterEmployeesByCode } from "@models/masterEmployeeModel.js";
import { appLogger } from "@utils/logger.js";
import { formatDate } from "@utils/formatDate.js";
import { DatabaseError } from "types/errorTypes.js";
import { getAttendanceSessionsByDate } from "@models/attendanceSessionModel.js";

/**
 * [POST] /attendances/check-in - Record Employee Check-In
 */
export const checkIn = async (req: AuthenticatedRequest, res: Response) => {
  const employeeCode = req.user!.employee_code;

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
    const profile = await getMasterEmployeesByCode(employeeCode);
    if (!profile) {
      appLogger.error(
        `FATAL: User Code ${req.user!.user_code} has no linked Employee profile.`
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
    console.log("now (local):", now.toString());
    console.log("now (UTC):", now.toISOString());
    console.log("openTime (local):", openTime.toString());
    console.log("openTime (UTC):", openTime.toISOString());
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
      employee_code: employeeCode,
      session_code: attendanceSession.session_code,
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
      appLogger.warn(`Employee ${employeeCode} attempted duplicate check-in.`);
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

    const employeeCode = req.user!.employee_code;
    const profile = await getMasterEmployeesByCode(employeeCode);
    if (!profile) {
      appLogger.error(
        `FATAL: User Code ${req.user!.user_code} has no linked Employee profile.`
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
      employee_code: employeeCode,
      session_code: attendanceSession.session_code,
      check_out_time: now,
      check_out_status: checkOutStatus,
    });

    if (!checkOutData) {
      appLogger.warn(
        `Employee ${employeeCode} attempted check-out, but no open record was found (Possible duplicate check-out).`
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
 * [GET] /attendances/:id - Fetch Attendance by id
 */
export const fetchAttendanceById = async (req: Request, res: Response) => {
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

    const attendances = await getAttendanceById(id);

    if (!attendances) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data absensi tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Abensi berhasil didapatkan",
      attendances,
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
 * [GET] /attendances/ - Fetch current employee attendance
 */
export const fetchEmployeeAttendance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const employeeCode = req.user!.employee_code;
    const attendances = await getEmployeeAttendances(employeeCode);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Absensi berhasil didapatkan",
      attendances,
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
