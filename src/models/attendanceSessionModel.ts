import {
  ATTENDANCE_SESSION_TABLE,
  EMPLOYEE_TABLE,
  USER_TABLE,
} from "@constants/database.js";
import { db } from "@core/config/knex.js";
import {
  AttendanceSession,
  CreateAttendanceSession,
  GetAllAttendanceSession,
  GetAttendanceById,
  UpdateAttendanceSession,
} from "types/attendanceSessionTypes.js";

/**
 * Function for generating attendance session code
 */
async function generateAttendanceCode() {
  const PREFIX = "SSA";
  const PAD_LENGTH = 7;

  const lastRow = await db(ATTENDANCE_SESSION_TABLE)
    .select("session_code")
    .orderBy("id", "desc")
    .first();

  if (!lastRow) {
    return PREFIX + String(1).padStart(PAD_LENGTH, "0");
  }

  const lastCode = lastRow.session_code;
  const lastNumber = parseInt(lastCode.replace(PREFIX, ""), 10);
  const newNumber = lastNumber + 1;
  return PREFIX + String(newNumber).padStart(PAD_LENGTH, "0");
}

/**
 * Get all attendance session
 */
export const getAllAttendanceSessions = async (): Promise<
  GetAllAttendanceSession[]
> =>
  await db(ATTENDANCE_SESSION_TABLE)
    .select(
      `${ATTENDANCE_SESSION_TABLE}.id`,
      `${ATTENDANCE_SESSION_TABLE}.session_code`,
      `${ATTENDANCE_SESSION_TABLE}.date`,
      `${ATTENDANCE_SESSION_TABLE}.status`,
      `${ATTENDANCE_SESSION_TABLE}.open_time`,
      `${ATTENDANCE_SESSION_TABLE}.cutoff_time`,
      `${ATTENDANCE_SESSION_TABLE}.close_time`,
      `${ATTENDANCE_SESSION_TABLE}.created_by`,

      // User Fields
      `${USER_TABLE}.role as created_by_role`,

      // Employee Fields
      `${EMPLOYEE_TABLE}.employee_code as created_by_employee_code`,
      `${EMPLOYEE_TABLE}.full_name as created_by_full_name`
    )
    .leftJoin(
      `${USER_TABLE}`,
      `${ATTENDANCE_SESSION_TABLE}.created_by`,
      `${USER_TABLE}.user_code`
    )
    .leftJoin(
      `${EMPLOYEE_TABLE}`,
      `${USER_TABLE}.employee_code`,
      `${EMPLOYEE_TABLE}.employee_code`
    );

/**
 * Get attendance session by date.
 */
export const getAttendanceSessionsByDate = async (
  date: string
): Promise<AttendanceSession | null> =>
  await db(ATTENDANCE_SESSION_TABLE)
    .select(
      `${ATTENDANCE_SESSION_TABLE}.id`,
      `${ATTENDANCE_SESSION_TABLE}.session_code`,
      `${ATTENDANCE_SESSION_TABLE}.date`,
      `${ATTENDANCE_SESSION_TABLE}.status`,
      `${ATTENDANCE_SESSION_TABLE}.open_time`,
      `${ATTENDANCE_SESSION_TABLE}.cutoff_time`,
      `${ATTENDANCE_SESSION_TABLE}.close_time`,
      `${ATTENDANCE_SESSION_TABLE}.created_by`,

      // User fields
      `${USER_TABLE}.role as created_by_role`,

      // Employee fields
      `${EMPLOYEE_TABLE}.employee_code as created_by_employee_code`,
      `${EMPLOYEE_TABLE}.full_name as created_by_full_name`
    )
    .leftJoin(
      `${USER_TABLE}`,
      `${ATTENDANCE_SESSION_TABLE}.created_by`,
      `${USER_TABLE}.user_code`
    )
    .leftJoin(
      `${EMPLOYEE_TABLE}`,
      `${EMPLOYEE_TABLE}.user_code`,
      `${USER_TABLE}.user_code`
    )
    .where(`${ATTENDANCE_SESSION_TABLE}.date`, date)
    .first();

/**
 * Get attendance session by ID.
 */
export const getAttendanceSessionsById = async (
  id: number
): Promise<GetAttendanceById | null> =>
  await db(ATTENDANCE_SESSION_TABLE)
    .select(
      `${ATTENDANCE_SESSION_TABLE}.id`,
      `${ATTENDANCE_SESSION_TABLE}.session_code`,
      `${ATTENDANCE_SESSION_TABLE}.date`,
      `${ATTENDANCE_SESSION_TABLE}.status`,
      `${ATTENDANCE_SESSION_TABLE}.open_time`,
      `${ATTENDANCE_SESSION_TABLE}.cutoff_time`,
      `${ATTENDANCE_SESSION_TABLE}.close_time`,
      `${ATTENDANCE_SESSION_TABLE}.created_by`,

      // User Fields
      `${USER_TABLE}.role as created_by_role`,

      // Employee Fields
      `${EMPLOYEE_TABLE}.employee_code as created_by_employee_code`,
      `${EMPLOYEE_TABLE}.full_name as created_by_full_name`
    )
    .leftJoin(
      `${USER_TABLE}`,
      `${ATTENDANCE_SESSION_TABLE}.created_by`,
      `${USER_TABLE}.user_code`
    )
    .leftJoin(
      `${EMPLOYEE_TABLE}`,
      `${USER_TABLE}.employee_code`,
      `${EMPLOYEE_TABLE}.employee_code`
    )
    .where(`${ATTENDANCE_SESSION_TABLE}.id`, id)
    .first();

/**
 * Get attendance session by Code.
 */
export const getAttendanceSessionsByCode = async (
  code: string
): Promise<GetAttendanceById | null> =>
  await db(ATTENDANCE_SESSION_TABLE)
    .select(
      `${ATTENDANCE_SESSION_TABLE}.id`,
      `${ATTENDANCE_SESSION_TABLE}.session_code`,
      `${ATTENDANCE_SESSION_TABLE}.date`,
      `${ATTENDANCE_SESSION_TABLE}.status`,
      `${ATTENDANCE_SESSION_TABLE}.open_time`,
      `${ATTENDANCE_SESSION_TABLE}.cutoff_time`,
      `${ATTENDANCE_SESSION_TABLE}.close_time`,
      `${ATTENDANCE_SESSION_TABLE}.created_by`,

      // User Fields
      `${USER_TABLE}.role as created_by_role`,

      // Employee Fields
      `${EMPLOYEE_TABLE}.employee_code as created_by_employee_code`,
      `${EMPLOYEE_TABLE}.full_name as created_by_full_name`
    )
    .leftJoin(
      `${USER_TABLE}`,
      `${ATTENDANCE_SESSION_TABLE}.created_by`,
      `${USER_TABLE}.user_code`
    )
    .leftJoin(
      `${EMPLOYEE_TABLE}`,
      `${USER_TABLE}.employee_code`,
      `${EMPLOYEE_TABLE}.employee_code`
    )
    .where(`${ATTENDANCE_SESSION_TABLE}.session_code`, code)
    .first();

/**
 * Creates a new attendance session.
 */
export const addAttendanceSessions = async (
  data: CreateAttendanceSession
): Promise<AttendanceSession> => {
  const session_code = await generateAttendanceCode();
  const sessionToInsert = {
    ...data,
    session_code,
  };

  const [id] = await db(ATTENDANCE_SESSION_TABLE).insert(sessionToInsert);
  return db(ATTENDANCE_SESSION_TABLE).where({ id }).first();
};

/**
 * edit an existing attendance record.
 */
export const editAttendanceSessions = async (
  data: UpdateAttendanceSession
): Promise<AttendanceSession | null> => {
  const { id, ...updateData } = data;

  await db(ATTENDANCE_SESSION_TABLE).where({ id }).update(updateData);
  return db(ATTENDANCE_SESSION_TABLE).where({ id }).first();
};

/**
 * Closed the existing attendance
 */
export const closedAttendanceSession = async (
  id: number
): Promise<AttendanceSession | null> => {
  await db(ATTENDANCE_SESSION_TABLE).where({ id }).update({
    status: "closed",
    updated_at: new Date(),
  });

  return db(ATTENDANCE_SESSION_TABLE).where({ id }).first();
};

/**
 * Remove existing attendance.
 */
export const removeAttendanceSessions = async (id: number): Promise<number> =>
  await db(ATTENDANCE_SESSION_TABLE).where({ id }).delete();
