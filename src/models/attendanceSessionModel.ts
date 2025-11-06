import { db } from "@core/config/knex.js";
import {
  AttendanceSession,
  CreateAttendanceSessionData,
  GetAttendanceById,
  UpdateAttendanceSessionData,
} from "types/attendanceSessionTypes.js";

const ATTENDANCE_SESSION_TABLE = "attendance_sessions";

/**
 * Get all attendance session
 */
export const getAllAttendanceSessions = async (): Promise<
  AttendanceSession[]
> => await db(ATTENDANCE_SESSION_TABLE).select("*");

/**
 * Get attendance session by date.
 */
export const getAttendanceSessionsByDate = async (
  date: string
): Promise<AttendanceSession | null> =>
  await db(ATTENDANCE_SESSION_TABLE).where({ date }).first();

/**
 * Get attendance session by ID.
 */
export const getAttendanceSessionsById = async (
  id: number
): Promise<GetAttendanceById | null> => {
  const attendanceSession = await db(ATTENDANCE_SESSION_TABLE)
    .select(
      `${ATTENDANCE_SESSION_TABLE}.*`,
      "u.email AS created_by_email",
      "u.role AS created_by_role",
      "e.first_name AS created_by_first_name",
      "e.last_name AS created_by_last_name"
    )
    .innerJoin({ u: "users" }, `${ATTENDANCE_SESSION_TABLE}.created_by`, "u.id")
    .innerJoin({ e: "master_employees" }, "u.employee_id", "e.id")
    .where(`${ATTENDANCE_SESSION_TABLE}.id`, id)
    .first();

  return attendanceSession || null;
};

/**
 * Creates a new attendance session.
 */
export const addAttendanceSessions = async (
  data: CreateAttendanceSessionData
): Promise<AttendanceSession> => {
  const { open_time, close_time, cutoff_time, status, date, created_by } = data;

  const [id] = await db(ATTENDANCE_SESSION_TABLE).insert({
    open_time,
    close_time,
    cutoff_time,
    status,
    created_by,
    date,
  });

  return db(ATTENDANCE_SESSION_TABLE).where({ id }).first();
};

/**
 * edit an existing attendance record.
 */
export const editAttendanceSessions = async (
  data: UpdateAttendanceSessionData
): Promise<AttendanceSession | null> => {
  const { id, open_time, close_time, cutoff_time, status, date } = data;

  await db(ATTENDANCE_SESSION_TABLE).where({ id }).update({
    open_time,
    close_time,
    cutoff_time,
    status,
    date,
    updated_at: new Date(),
  });
  return db(ATTENDANCE_SESSION_TABLE).where({ id }).first();
};

/**
 * Remove existing attendance.
 */
export const removeAttendanceSessions = async (id: number): Promise<number> =>
  await db(ATTENDANCE_SESSION_TABLE).where({ id }).delete();
