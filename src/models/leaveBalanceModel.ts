import { Knex } from "knex";
import { db } from "@core/config/knex.js";
import {
  BulkGrantData,
  EmployeeBalanceReport,
  LeaveBalance,
  LeaveBalanceReport,
  SpecificUpdateData,
} from "types/leaveBalanceTypes.js";
import { LeaveRequest } from "types/leaveRequestTypes.js";

const LEAVE_BALANCE_TABLE = "leave_balances";
const EMPLOYEE_TABLE = "master_employees";
const LEAVE_TYPE_TABLE = "master_leave_types";
const POSITION_TABLE = "master_positions";
const DEPARTMENT_TABLE = "master_departments";

/**
 * Creates or increments the leave balance for ALL active employees.
 */
export const bulkGrantLeaveBalances = async (
  data: BulkGrantData
): Promise<number> => {
  // 1. Fetch all active employee IDs
  const employees = await db(EMPLOYEE_TABLE).select("id");

  if (employees.length === 0) {
    return 0;
  }

  let affectedCount = 0;

  // 2. Perform the upsert logic within a transaction
  await db.transaction(async (trx: Knex.Transaction) => {
    for (const employee of employees) {
      const employeeId = employee.id;

      // Attempt 1: UPDATE the existing record (if it exists)
      const updated = await trx(LEAVE_BALANCE_TABLE)
        .where({
          employee_id: employeeId,
          leave_type_id: data.leave_type_id,
          year: data.year,
        })
        .increment("balance", data.amount); // Atomically add the amount

      if (updated === 0) {
        // Attempt 2: INSERT the new record (if no update occurred)
        await trx(LEAVE_BALANCE_TABLE).insert({
          employee_id: employeeId,
          leave_type_id: data.leave_type_id,
          year: data.year,
          balance: data.amount,
        });
      }
      affectedCount++;
    }
  });

  return affectedCount;
};

/**
 * Sets or overwrites the absolute leave balance for a single employee.
 */
export const setSpecificLeaveBalance = async (
  data: SpecificUpdateData
): Promise<LeaveBalance | null> => {
  const { employee_id, leave_type_id, year, amount } = data;

  // 1. Attempt to update the existing record
  const updatedCount = await db(LEAVE_BALANCE_TABLE)
    .where({ employee_id, leave_type_id, year })
    .update({
      balance: amount, // Overwrite the current balance
      updated_at: db.fn.now(),
    });

  // 2. If no record was updated, try to INSERT it
  if (updatedCount === 0) {
    // We only insert if the update failed, checking if the employee actually exists
    // (The FK constraint will fail if the employee/type doesn't exist)
    await db(LEAVE_BALANCE_TABLE).insert({
      employee_id,
      leave_type_id,
      year,
      balance: amount,
    });
    // If successful, treat it as an update/set operation
  }

  // 3. Retrieve and return the updated/inserted record
  return db(LEAVE_BALANCE_TABLE)
    .where({ employee_id, leave_type_id, year })
    .first() as Promise<LeaveBalance | null>;
};

/**
 * Deletes all leave balance records matching a specific type and year.
 * @returns The number of records deleted.
 */
export async function removeBulkLeaveBalances(
  leaveTypeId: number,
  year: number
): Promise<number> {
  return db(LEAVE_BALANCE_TABLE)
    .where({
      leave_type_id: leaveTypeId,
      year: year,
    })
    .del();
}

/**
 * Retrieves all leave balances for a single employee for the current year,
 */
export const getEmployeeLeaveBalances = async (
  employeeId: number
): Promise<EmployeeBalanceReport[]> => {
  const currentYear = new Date().getFullYear();

  const balances = await db(LEAVE_BALANCE_TABLE)
    .select(
      `${LEAVE_BALANCE_TABLE}.*`,
      `${LEAVE_TYPE_TABLE}.name as leave_type_name`
    )
    .where({
      [`${LEAVE_BALANCE_TABLE}.employee_id`]: employeeId,
      [`${LEAVE_BALANCE_TABLE}.year`]: currentYear,
    })
    .leftJoin(
      LEAVE_TYPE_TABLE,
      `${LEAVE_BALANCE_TABLE}.leave_type_id`,
      `${LEAVE_TYPE_TABLE}.id`
    );

  return balances as EmployeeBalanceReport[];
};

/**
 * Retrieves a comprehensive report of all leave balances across all employees,
 */
export const getAllLeaveBalanceReport = async (): Promise<
  LeaveBalanceReport[]
> => {
  const reportData = await db(LEAVE_BALANCE_TABLE)
    .select(
      // 1. Leave Balance Data
      `${LEAVE_BALANCE_TABLE}.id`,
      `${LEAVE_BALANCE_TABLE}.balance`,
      `${LEAVE_BALANCE_TABLE}.year`,

      // 2. Employee Data
      `${EMPLOYEE_TABLE}.id as employee_id`,
      db.raw("CONCAT(??, ' ', ??) as employee_full_name", [
        `${EMPLOYEE_TABLE}.first_name`,
        `${EMPLOYEE_TABLE}.last_name`,
      ]),

      // 3. Position Data
      `${POSITION_TABLE}.name as position_name`,

      // 4. Department Data
      `${DEPARTMENT_TABLE}.name as department_name`,

      // 5. Leave Type Data
      `${LEAVE_TYPE_TABLE}.id as leave_type_id`,
      `${LEAVE_TYPE_TABLE}.name as leave_type_name`
    )
    // JOIN 1: Employee Profile
    .leftJoin(
      EMPLOYEE_TABLE,
      `${LEAVE_BALANCE_TABLE}.employee_id`,
      `${EMPLOYEE_TABLE}.id`
    )

    // JOIN 2: Position
    .leftJoin(
      POSITION_TABLE,
      `${EMPLOYEE_TABLE}.position_id`,
      `${POSITION_TABLE}.id`
    )

    // JOIN 3: Department
    .leftJoin(
      DEPARTMENT_TABLE,
      `${POSITION_TABLE}.department_id`,
      `${DEPARTMENT_TABLE}.id`
    )

    // JOIN 4: Leave Type
    .leftJoin(
      LEAVE_TYPE_TABLE,
      `${LEAVE_BALANCE_TABLE}.leave_type_id`,
      `${LEAVE_TYPE_TABLE}.id`
    )

    // Order by name for readability
    .orderBy("employee_full_name", "asc");

  return reportData;
};

/**
 * Retrieves a single leave balance record for a specific employee and leave type.
 */
export const findEmployeeBalance = async (
  employeeId: number,
  leaveTypeId: number
): Promise<LeaveBalance | null> => {
  const currentYear = new Date().getFullYear();

  const balanceRecord = await db(LEAVE_BALANCE_TABLE)
    .where({
      employee_id: employeeId,
      leave_type_id: leaveTypeId,
      year: currentYear,
    })
    .select("*")
    .first();

  // Note: If no record is found (first time request), the result is null.
  return balanceRecord ?? null;
};

/**
 * Deduct leave balance record
 */
export const deductLeaveBalance = async (
  leaveRequest: LeaveRequest
): Promise<LeaveBalance | null> => {
  const currentYear = new Date().getFullYear();
  const { employee_id, leave_type_id, total_days } = leaveRequest;

  await db(LEAVE_BALANCE_TABLE)
    .where({
      employee_id,
      leave_type_id,
      year: currentYear,
    })
    .decrement("balance", total_days);

  return db(LEAVE_BALANCE_TABLE)
    .where({ employee_id, leave_type_id, year: currentYear })
    .first();
};
