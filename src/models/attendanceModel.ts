import { db } from "@core/config/knex.js";
import {
  Attendance,
  CheckInPayload,
  CheckOutPayload,
} from "types/attendanceTypes.js";

const ATTENDANCE_TABLE = "attendances";

/**
 * Creates a new attendance record (check-in).
 */
export const recordCheckIn = async ({
  employee_id,
  check_in_time,
  work_date,
}: CheckInPayload): Promise<Attendance> => {
  const [id] = await db(ATTENDANCE_TABLE).insert({
    employee_id,
    check_in_time,
    work_date,
  });

  return db(ATTENDANCE_TABLE).where({ id }).first();
};

/**
 *   Updates the existing attendance record (check-out) for the current day.
 */
export const recordCheckOut = async ({
  employee_id,
  check_out_time,
  work_date,
}: CheckOutPayload): Promise<Attendance | null> => {
  const updateCount = await db(ATTENDANCE_TABLE)
    .where({ employee_id, work_date })
    .whereNull("check_out_time")
    .update({ check_out_time, updated_at: new Date() });

  if (updateCount === 0) {
    return null;
  }

  return db(ATTENDANCE_TABLE).where({ employee_id, work_date }).first();
};

/**
 * Get all attendance.
 */
export const getAllAttendances = async (): Promise<Attendance[]> =>
  await db(ATTENDANCE_TABLE).select("*");
