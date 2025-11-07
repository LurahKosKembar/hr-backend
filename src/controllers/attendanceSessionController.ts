import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response.js";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import { appLogger } from "@utils/logger.js";
import { DatabaseError } from "types/errorTypes.js";
import {
  addAttendanceSessions,
  closedAttendanceSession,
  editAttendanceSessions,
  getAllAttendanceSessions,
  getAttendanceSessionsById,
  removeAttendanceSessions,
} from "@models/attendanceSessionModel.js";
import {
  addAttendanceSessionsSchema,
  updateAttendanceSessionsSchema,
} from "@schemas/attendanceSessionSchema.js";
import { AuthenticatedRequest } from "@middleware/jwt.js";
import { formatIndonesianDate } from "@utils/formatDate.js";

/**
 * [GET] /attendance-sessions - Fetch all Attendance session
 */
export const fetchAllAttendanceSessions = async (
  req: Request,
  res: Response
) => {
  try {
    const attendanceSessions = await getAllAttendanceSessions();

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data sesi absensi berhasil di dapatkan",
      attendanceSessions,
      200,
      RESPONSE_DATA_KEYS.ATTENDANCE_SESSIONS
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching attendance sessions:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [GET] /attendance-sessions/:id - Fetch Attendance Session by id
 */
export const fetchAttendanceSessionsById = async (
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
        "ID sesi absensi tidak valid.",
        400
      );
    }

    const attendanceSessions = await getAttendanceSessionsById(id);

    if (!attendanceSessions) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data sesi absensi tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data sesi absensi berhasil didapatkan",
      attendanceSessions,
      200,
      RESPONSE_DATA_KEYS.ATTENDANCE_SESSIONS
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching attendance sessions:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [POST] /attendance-sessions - Create a new Attendance Session
 */
export const createAttendanceSessions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const validation = addAttendanceSessionsSchema.safeParse(req.body);
    const currentUserId = req.user!.id;

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

    const { status, cutoff_time, close_time, open_time, date } =
      validation.data;

    const attendanceSessions = await addAttendanceSessions({
      status,
      cutoff_time,
      close_time,
      open_time,
      created_by: currentUserId,
      date,
    });

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data sesi absensi berhasil dibuat",
      attendanceSessions,
      201,
      RESPONSE_DATA_KEYS.ATTENDANCE_SESSIONS
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    // Handle duplicate date constraint
    if (dbError.code === "ER_DUP_ENTRY" || dbError.errno === 1062) {
      const errorMessage = dbError.sqlMessage || dbError.message;

      if (
        errorMessage &&
        (errorMessage.includes("date") ||
          errorMessage.includes("uni_attendance_sessions_date"))
      ) {
        appLogger.warn(
          "AttendanceSession creation failed: Duplicate session date entry."
        );
        return errorResponse(
          res,
          API_STATUS.BAD_REQUEST,
          "Validasi gagal",
          400,
          [
            {
              field: "date",
              message:
                "Tanggal sesi absensi sudah ada. Hanya boleh ada satu sesi per tanggal.",
            },
          ]
        );
      }
    }

    appLogger.error(`Error creating attendance session: ${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [PUT] /attendance-sessions/:id - Update an Attendance Session
 */
export const updateAttendanceSessions = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID sesi absensi tidak valid.",
        400
      );
    }

    // Validate request body
    const validation = updateAttendanceSessionsSchema.safeParse(req.body);
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

    const { date, status, open_time, close_time, cutoff_time } =
      validation.data;

    const attendanceSession = await editAttendanceSessions({
      id,
      cutoff_time,
      close_time,
      open_time,
      status,
      date,
    });

    // Check if not found
    if (!attendanceSession) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data sesi absensi tidak ditemukan.",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data sesi absensi berhasil diperbarui.",
      attendanceSession,
      200,
      RESPONSE_DATA_KEYS.ATTENDANCE_SESSIONS
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    // Handle duplicate date constraint
    if (dbError.code === "ER_DUP_ENTRY" || dbError.errno === 1062) {
      const errorMessage = dbError.sqlMessage || dbError.message;

      if (
        errorMessage &&
        (errorMessage.includes("date") ||
          errorMessage.includes("uni_attendance_sessions_date"))
      ) {
        appLogger.warn(
          "AttendanceSession update failed: Duplicate session date entry."
        );
        return errorResponse(
          res,
          API_STATUS.BAD_REQUEST,
          "Validasi gagal",
          400,
          [
            {
              field: "date",
              message:
                "Tanggal sesi absensi sudah ada. Hanya boleh ada satu sesi per tanggal.",
            },
          ]
        );
      }
    }

    appLogger.error(`Error updating attendance session: ${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [GET] /attendance-sessions/:id/closed - Closed an Attendance Session
 */
export const updateAttendanceSessionsStatus = async (
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
        "ID sesi absensi tidak valid.",
        400
      );
    }

    // update status to closed
    const attendanceSession = await closedAttendanceSession(id);

    if (!attendanceSession) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "ID sesi absensi tidak ditemukan",
        404
      );
    }
    const formattedDate = formatIndonesianDate(attendanceSession.date);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      `Berhasil menutup sesi absensi pada tanggal ${formattedDate}`,
      attendanceSession,
      200,
      RESPONSE_DATA_KEYS.ATTENDANCE_SESSIONS
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    appLogger.error(`Error updating attendance session: ${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [DELETE] /attendance-sessions/:id - Delete an Attendance Session
 */
export const destroyAttendanceSessions = async (
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
        "ID sesi absensi tidak valid.",
        400
      );
    }

    // Check if the session exists
    const existing = await getAttendanceSessionsById(id);
    if (!existing) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data sesi absensi tidak ditemukan.",
        404
      );
    }

    // Proceed to delete
    await removeAttendanceSessions(existing.id);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data sesi absensi berhasil dihapus.",
      null,
      200
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    // Handle foreign key constraint (e.g. session is referenced by attendances)
    if (
      dbError.code === "ER_ROW_IS_REFERENCED" ||
      dbError.errno === 1451 ||
      (dbError.message &&
        dbError.message.includes("foreign key constraint fails"))
    ) {
      appLogger.warn(
        `Failed to delete attendance session ID ${req.params.id} due to constraint.`
      );
      return errorResponse(
        res,
        API_STATUS.CONFLICT,
        "Tidak dapat menghapus sesi absensi karena masih digunakan oleh data absensi karyawan.",
        409
      );
    }

    // Catch-all for other server errors
    appLogger.error(`Error deleting attendance session: ${error}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};
