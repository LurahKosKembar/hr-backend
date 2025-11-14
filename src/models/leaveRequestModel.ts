import {
  EMPLOYEE_TABLE,
  LEAVE_REQUEST_TABLE,
  LEAVE_TYPE_TABLE,
} from "@constants/database.js";
import { db } from "@core/config/knex.js";
import { Knex } from "knex";
import {
  LeaveRequest,
  UpdateLeaveStatusData,
  GetAllLeaveRequest,
  GetLeaveRequestById,
  CreateLeaveRequest,
  UpdateLeaveRequest,
} from "types/leaveRequestTypes.js";

/**
 * Function for generating leave request code
 */
async function generateRequestCode() {
  const PREFIX = "PCT";
  const PAD_LENGTH = 7;

  const lastRow = await db(LEAVE_REQUEST_TABLE)
    .select("request_code")
    .orderBy("id", "desc")
    .first();

  if (!lastRow) {
    return PREFIX + String(1).padStart(PAD_LENGTH, "0");
  }

  const lastCode = lastRow.request_code;
  const lastNumber = parseInt(lastCode.replace(PREFIX, ""), 10);
  const newNumber = lastNumber + 1;
  return PREFIX + String(newNumber).padStart(PAD_LENGTH, "0");
}

/**
 * Get all master leave request.
 */
export const getAllLeaveRequests = async (data: {
  typeCode?: string;
  employeeCode?: string;
  status?: "pending" | "approved" | "rejected";
}): Promise<GetAllLeaveRequest[]> => {
  const { typeCode, employeeCode, status } = data;
  const APPROVER_ALIAS = "approver_employee";

  let query = db(LEAVE_REQUEST_TABLE)
    .select(
      `${LEAVE_REQUEST_TABLE}.id`,
      `${LEAVE_REQUEST_TABLE}.request_code`,
      `${LEAVE_REQUEST_TABLE}.employee_code`,
      `${LEAVE_REQUEST_TABLE}.type_code`,
      `${LEAVE_REQUEST_TABLE}.start_date`,
      `${LEAVE_REQUEST_TABLE}.end_date`,
      `${LEAVE_REQUEST_TABLE}.total_days`,
      `${LEAVE_REQUEST_TABLE}.reason`,
      `${LEAVE_REQUEST_TABLE}.status`,
      `${LEAVE_REQUEST_TABLE}.approved_by_user_code`,
      `${LEAVE_REQUEST_TABLE}.approval_date`,
      `${EMPLOYEE_TABLE}.full_name as employee_name`,
      `${LEAVE_TYPE_TABLE}.name as type_name`,
      `${APPROVER_ALIAS}.full_name as approved_by_name`
    )
    .leftJoin(
      `${LEAVE_TYPE_TABLE}`,
      `${LEAVE_REQUEST_TABLE}.type_code`,
      `${LEAVE_TYPE_TABLE}.type_code`
    )
    .leftJoin(
      `${EMPLOYEE_TABLE}`,
      `${LEAVE_REQUEST_TABLE}.employee_code`,
      `${EMPLOYEE_TABLE}.employee_code`
    )
    .leftJoin(
      `${EMPLOYEE_TABLE} as ${APPROVER_ALIAS}`,
      `${LEAVE_REQUEST_TABLE}.approved_by_user_code`,
      `${APPROVER_ALIAS}.employee_code`
    );

  if (typeCode) {
    query = query.where(`${LEAVE_REQUEST_TABLE}.type_code`, typeCode);
  }

  if (employeeCode) {
    query = query.where(`${LEAVE_REQUEST_TABLE}.employee_code`, employeeCode);
  }

  if (status) {
    query = query.where(`${LEAVE_REQUEST_TABLE}.status`, status);
  }

  return query;
};

/**
 * Get a specific leave request by ID.
 */
export const getLeaveRequestsById = async (
  id: number
): Promise<GetLeaveRequestById | null> => {
  {
    const APPROVER_ALIAS = "approver_employee";
    return db(LEAVE_REQUEST_TABLE)
      .select(
        `${LEAVE_REQUEST_TABLE}.*`,
        `${EMPLOYEE_TABLE}.full_name as employee_name`,
        `${LEAVE_TYPE_TABLE}.name as type_name`,
        `${APPROVER_ALIAS}.full_name as approved_by_name`
      )
      .leftJoin(
        `${LEAVE_TYPE_TABLE}`,
        `${LEAVE_REQUEST_TABLE}.type_code`,
        `${LEAVE_TYPE_TABLE}.type_code`
      )
      .leftJoin(
        `${EMPLOYEE_TABLE}`,
        `${LEAVE_REQUEST_TABLE}.employee_code`,
        `${EMPLOYEE_TABLE}.employee_code`
      )
      .leftJoin(
        `${EMPLOYEE_TABLE} as ${APPROVER_ALIAS}`,
        `${LEAVE_REQUEST_TABLE}.approved_by_user_code`,
        `${APPROVER_ALIAS}.employee_code`
      )
      .where({ "leave_requests.id": id })
      .first();
  }
};

/**
 * Get a specific leave request by code.
 */
export const getLeaveRequestByCodes = async (
  code: string
): Promise<GetLeaveRequestById | null> => {
  {
    const APPROVER_ALIAS = "approver_employee";
    return db(LEAVE_REQUEST_TABLE)
      .select(
        `${LEAVE_REQUEST_TABLE}.*`,
        `${EMPLOYEE_TABLE}.full_name as employee_name`,
        `${LEAVE_TYPE_TABLE}.name as type_name`,
        `${APPROVER_ALIAS}.full_name as approved_by_name`
      )
      .leftJoin(
        `${LEAVE_TYPE_TABLE}`,
        `${LEAVE_REQUEST_TABLE}.type_code`,
        `${LEAVE_TYPE_TABLE}.type_code`
      )
      .leftJoin(
        `${EMPLOYEE_TABLE}`,
        `${LEAVE_REQUEST_TABLE}.employee_code`,
        `${EMPLOYEE_TABLE}.employee_code`
      )
      .leftJoin(
        `${EMPLOYEE_TABLE} as ${APPROVER_ALIAS}`,
        `${LEAVE_REQUEST_TABLE}.approved_by_user_code`,
        `${APPROVER_ALIAS}.employee_code`
      )
      .where({ "leave_requests.request_code": code })
      .first();
  }
};

/**
 * Get all leave request that belong to an employee.
 */
export const getEmployeeLeaveRequest = async (
  employeeCode: string
): Promise<GetAllLeaveRequest[]> => {
  const APPROVER_ALIAS = "approver_employee";
  return db(LEAVE_REQUEST_TABLE)
    .select(
      `${LEAVE_REQUEST_TABLE}.*`,
      `${EMPLOYEE_TABLE}.full_name as employee_name`,
      `${LEAVE_TYPE_TABLE}.name as type_name`,
      `${APPROVER_ALIAS}.full_name as approved_by_name`
    )
    .leftJoin(
      `${LEAVE_TYPE_TABLE}`,
      `${LEAVE_REQUEST_TABLE}.type_code`,
      `${LEAVE_TYPE_TABLE}.type_code`
    )
    .leftJoin(
      `${EMPLOYEE_TABLE}`,
      `${LEAVE_REQUEST_TABLE}.employee_code`,
      `${EMPLOYEE_TABLE}.employee_code`
    )
    .leftJoin(
      `${EMPLOYEE_TABLE} as ${APPROVER_ALIAS}`,
      `${LEAVE_REQUEST_TABLE}.approved_by_user_code`,
      `${APPROVER_ALIAS}.employee_code`
    )
    .where({ "leave_requests.employee_code": employeeCode })
    .first();
};

/**
 * Creates a new leave request
 */
export const addLeaveRequests = async (
  data: CreateLeaveRequest
): Promise<LeaveRequest> => {
  const request_code = await generateRequestCode();
  const leaveRequestToInsert = {
    request_code: request_code,
    employee_code: data.employee_code,
    type_code: data.type_code,
    start_date: data.start_date,
    end_date: data.end_date,
    total_days: data.total_days,
    reason: data.reason,
  };

  const [id] = await db(LEAVE_REQUEST_TABLE).insert(leaveRequestToInsert);
  return db(LEAVE_REQUEST_TABLE).where({ id }).first();
};

/**
 * edit an existing leave request record.
 */
export const editLeaveRequests = async (
  data: UpdateLeaveRequest
): Promise<LeaveRequest | null> => {
  const { id, ...updateData } = data;

  await db(LEAVE_REQUEST_TABLE).where({ id }).update(updateData);
  return db(LEAVE_REQUEST_TABLE).where({ id }).first();
};

/**
 * Updates the status of a specific leave request.
 */
export const editLeaveRequestStatus = async (
  data: UpdateLeaveStatusData
): Promise<LeaveRequest | null> => {
  const { id, new_status, approved_by_user_code } = data;

  await db(LEAVE_REQUEST_TABLE).where({ id }).update({
    status: new_status,
    approval_date: db.fn.now(),
    approved_by_user_code,
  });
  return db(LEAVE_REQUEST_TABLE).where({ id }).first();
};

/**
 * Remove existing leave request
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
  return Number(result?.total_deductions || 0);
};
