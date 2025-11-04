import { db } from "@core/config/knex.js";
import {
  CreateLeaveRequestData,
  LeaveRequest,
  UpdateLeaveStatusData,
} from "types/leaveRequestTypes.js";

const LEAVE_REQUEST_TABLE = "leave_requests";

/**
 * Get all leave requests for Admin monitoring (can be filtered later).
 */
export const getAllLeaveRequests = async (): Promise<LeaveRequest[]> => {
  return db(LEAVE_REQUEST_TABLE)
    .select("*")
    .orderBy("created_at", "desc") as Promise<LeaveRequest[]>;
};

/**
 * Get a specific leave request by ID.
 */
export const getLeaveRequestById = async (
  id: number
): Promise<LeaveRequest | null> => {
  return db(LEAVE_REQUEST_TABLE).where({ id }).first();
};

/**
 * Creates a new leave request
 */
export const addLeaveRequest = async (
  {
    employee_id,
    leave_type_id,
    start_date,
    end_date,
    reason,
    total_days,
  }: CreateLeaveRequestData & { total_days: number } // Ensure total_days is included
): Promise<LeaveRequest> => {
  // 1. Prepare the payload
  const [id] = await db(LEAVE_REQUEST_TABLE).insert({
    employee_id,
    leave_type_id,
    total_days,
    reason,
    start_date,
    end_date,
  });

  return db(LEAVE_REQUEST_TABLE).where({ id }).first();
};

/**
 * Updates the status of a specific leave request.
 */
export const editLeaveRequestStatus = async (
  data: UpdateLeaveStatusData
): Promise<LeaveRequest | null> => {
  const { id, new_status, approved_by_id } = data;

  await db(LEAVE_REQUEST_TABLE).where({ id }).update({
    status: new_status,
    approval_date: db.fn.now(),
    approved_by_id,
    updated_at: db.fn.now(),
  });

  return db(LEAVE_REQUEST_TABLE).where({ id }).first();
};

/**
 * Permanently removes a leave request record from the database.
 */
export async function removeLeaveRequest(id: number): Promise<number> {
  return db(LEAVE_REQUEST_TABLE).where({ id }).del();
}
