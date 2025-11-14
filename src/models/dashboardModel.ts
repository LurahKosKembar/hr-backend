import { db } from "@core/config/knex.js";
import {
  ATTENDANCE_SESSION_TABLE,
  ATTENDANCE_TABLE,
  LEAVE_REQUEST_TABLE,
} from "@constants/database.js";
import { AttendanceSession } from "types/attendanceSessionTypes.js";

/**
 * Get information for total attendance and absences for one employee
 */
export const calculateTotalAttendancesAndAbsences = async (
  employeeCode: string,
  month: number,
  year: number
): Promise<{ totalAttendance: number; totalNotAttend: number }> => {
  // Determine the start and end dates for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // Get TOTAL POSSIBLE SESSIONS that already closed for the month
  const [totalSessionsResult] = await db(ATTENDANCE_SESSION_TABLE)
    .whereBetween("date", [startDate, endDate])
    .where("status", "closed")
    .count("id as total_sessions");

  const totalSessions = parseInt(
    String(totalSessionsResult.total_sessions || 0),
    10
  );

  const totalPresentResult = await db(ATTENDANCE_TABLE)
    .where("employee_code", employeeCode)
    .whereIn("check_in_status", ["in-time", "late"])
    .whereExists(function () {
      this.select("*")
        .from(ATTENDANCE_SESSION_TABLE)
        .whereRaw(
          `${ATTENDANCE_SESSION_TABLE}.session_code = ${ATTENDANCE_TABLE}.session_code`
        )
        .andWhere(`${ATTENDANCE_SESSION_TABLE}.status`, "closed")
        .andWhereBetween(`${ATTENDANCE_SESSION_TABLE}.date`, [
          startDate,
          endDate,
        ]);
    })
    .count("id as total_present")
    .first();

  const totalPresent = parseInt(
    String(totalPresentResult?.total_present || 0),
    10
  );

  // Calculate total absence
  const totalAbsence =
    totalSessions > totalPresent ? totalSessions - totalPresent : 0;

  return {
    totalAttendance: totalPresent,
    totalNotAttend: totalAbsence,
  };
};

/**
 * Calculate total attendances for specific day if the session is opened.
 */
export const calculateTotalAttendances = async (
  date: string,
  attendanceSession: AttendanceSession
): Promise<number> => {
  const result = await db(ATTENDANCE_TABLE)
    .where({
      session_code: attendanceSession.session_code,
    })
    .count("id as total")
    .first();

  return Number(result?.total ?? 0);
};

/**
 * Calculate total leave request that are still pending
 */
export const calculateTotalLeaveRequest = async (
  month: number,
  year: number
): Promise<Number> => {
  // Determine the start and end dates for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // Get Total leave request that still pending for the month
  const [totalLeaveRequestResult] = await db(LEAVE_REQUEST_TABLE)
    .whereBetween("created_at", [startDate, endDate])
    .where("status", "pending")
    .count("id as total_leave_requests");

  const totalLeaveRequest = parseInt(
    String(totalLeaveRequestResult.total_leave_requests || 0),
    10
  );

  return totalLeaveRequest;
};
