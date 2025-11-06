import { db } from "@core/config/knex.js";
import { Knex } from "knex";
import {
  CreateLeaveRequestData,
  LeaveRequest,
  UpdateLeaveStatusData,
} from "types/leaveRequestTypes.js";

const LEAVE_REQUEST_TABLE = "leave_requests";
const LEAVE_TYPE_TABLE = "master_leave_types";

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

/**
 * Get total approved leave days for an employee in a given date range.
 */
export const getTotalLeaveDays = async (
  employeeId: number,
  startDate: string,
  endDate: string,
  knexInstance: Knex.Transaction
): Promise<number> => {
  const result = await knexInstance(LEAVE_REQUEST_TABLE)
    .sum("total_days as total_leave_days")
    .where("employee_id", employeeId)
    .andWhere("status", "approved")
    .andWhere("start_date", ">=", startDate)
    .andWhere("end_date", "<=", endDate)
    .first();

  return Number(result?.total_leave_days || 0);
};

/**
 * Calculate the total salary deduction for an employee
 * based on approved leave requests within a given period.
 */
export const getTotalDeductionAmount = async (
  employeeId: number,
  startDate: string,
  endDate: string,
  trx?: Knex.Transaction
): Promise<number> => {
  const query = db(LEAVE_REQUEST_TABLE)
    .join(
      LEAVE_TYPE_TABLE,
      `${LEAVE_REQUEST_TABLE}.leave_type_id`,
      "=",
      `${LEAVE_TYPE_TABLE}.id`
    )
    .where(`${LEAVE_REQUEST_TABLE}.employee_id`, employeeId)
    .andWhere(`${LEAVE_REQUEST_TABLE}.status`, "approved")
    .andWhereBetween(`${LEAVE_REQUEST_TABLE}.start_date`, [startDate, endDate])
    .andWhereBetween(`${LEAVE_REQUEST_TABLE}.end_date`, [startDate, endDate])
    .sum({
      total_deductions: db.raw(
        "`leave_requests`.`total_days` * `master_leave_types`.`deduction`"
      ),
    })
    .first();

  const result = trx ? await query.transacting(trx) : await query;
  console.log(result);
  return Number(result?.total_deductions || 0);
};
