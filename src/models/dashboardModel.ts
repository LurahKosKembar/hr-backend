import { db } from "@core/config/knex.js";
import {
  ATTENDANCE_SESSION_TABLE,
  ATTENDANCE_TABLE,
} from "@constants/database.js";

/**
 * Get information for total attendance and absences
 */
export const calculateTotalAttendancesAndAbsences = async (
  employeeId: number,
  month: number,
  year: number
): Promise<{ totalAttendance: number; totalNotAttend: number }> => {
  // Determine the start and end dates for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // 1. Get TOTAL POSSIBLE SESSIONS that already closed for the month
  const [totalSessionsResult] = await db(ATTENDANCE_SESSION_TABLE)
    .whereBetween("date", [startDate, endDate])
    .where("status", "closed")
    .count("id as total_sessions");

  const totalSessions = parseInt(
    String(totalSessionsResult.total_sessions || 0),
    10
  );

  const totalPresentResult = await db(ATTENDANCE_TABLE)
    .where("employee_id", employeeId)
    .whereIn("check_in_status", ["in-time", "late"])
    .whereExists(function () {
      this.select("*")
        .from(ATTENDANCE_SESSION_TABLE)
        .whereRaw(
          `${ATTENDANCE_SESSION_TABLE}.id = ${ATTENDANCE_TABLE}.session_id`
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
