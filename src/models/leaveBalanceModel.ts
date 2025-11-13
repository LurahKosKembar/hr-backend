import { Knex } from "knex";
import { db } from "@core/config/knex.js";
import {
  CreateBulkLeaveBalance,
  CreateLeaveBalance,
  GetAllLeaveBalance,
  GetLeaveBalanceById,
  LeaveBalance,
  UpdateLeaveBalance,
} from "types/leaveBalanceTypes.js";
import {
  EMPLOYEE_TABLE,
  LEAVE_BALANCE_TABLE,
  LEAVE_TYPE_TABLE,
} from "@constants/database.js";

/**
 * Function for generating leave balance code
 */
async function generateLeaveBalanceCode() {
  const PREFIX = "JTC";
  const PAD_LENGTH = 7;

  const lastRow = await db(LEAVE_BALANCE_TABLE)
    .select("balance_code")
    .orderBy("id", "desc")
    .first();

  if (!lastRow) {
    return PREFIX + String(1).padStart(PAD_LENGTH, "0");
  }

  const lastCode = lastRow.balance_code;
  const lastNumber = parseInt(lastCode.replace(PREFIX, ""), 10);
  const newNumber = lastNumber + 1;
  return PREFIX + String(newNumber).padStart(PAD_LENGTH, "0");
}

/**
 * Function for get the start of code number
 */
async function getNextStartingCodeNumber(): Promise<number> {
  const PREFIX = "JTC";
  const lastRow = await db(LEAVE_BALANCE_TABLE)
    .select("balance_code")
    .orderBy("id", "desc")
    .first();

  if (!lastRow) {
    return 1;
  }

  const lastCode = lastRow.balance_code;
  return parseInt(lastCode.replace(PREFIX, ""), 10) + 1;
}

/**
 * Get all leave balance.
 */
export const getAllLeaveBalances = async (
  year?: number,
  typeCode?: string
): Promise<GetAllLeaveBalance[]> => {
  let query = db(LEAVE_BALANCE_TABLE)
    .select(
      `${LEAVE_BALANCE_TABLE}.id`,
      `${LEAVE_BALANCE_TABLE}.balance_code`,
      `${LEAVE_BALANCE_TABLE}.balance`,
      `${LEAVE_BALANCE_TABLE}.year`,
      `${LEAVE_BALANCE_TABLE}.employee_code`,
      `${EMPLOYEE_TABLE}.full_name as employee_name`,
      `${LEAVE_BALANCE_TABLE}.type_code`,
      `${LEAVE_TYPE_TABLE}.name as leave_type_name`
    )
    .leftJoin(
      `${LEAVE_TYPE_TABLE}`,
      `${LEAVE_BALANCE_TABLE}.type_code`,
      `${LEAVE_TYPE_TABLE}.type_code`
    )
    .leftJoin(
      `${EMPLOYEE_TABLE}`,
      `${LEAVE_BALANCE_TABLE}.employee_code`,
      `${EMPLOYEE_TABLE}.employee_code`
    );

  if (year) {
    query = query.where(`${LEAVE_BALANCE_TABLE}.year`, year);
  }

  if (typeCode) {
    query = query.where(`${LEAVE_BALANCE_TABLE}.type_code`, typeCode);
  }

  return query;
};

/**
 * Get all leave balance belongs to employee.
 */
export const getAllEmployeeLeaveBalance = async (
  employeeCode: string
): Promise<GetAllLeaveBalance[]> =>
  await db(LEAVE_BALANCE_TABLE)
    .select(
      `${LEAVE_BALANCE_TABLE}.id`,
      `${LEAVE_BALANCE_TABLE}.balance_code`,
      `${LEAVE_BALANCE_TABLE}.balance`,
      `${LEAVE_BALANCE_TABLE}.year`,
      `${LEAVE_BALANCE_TABLE}.employee_code`,
      `${EMPLOYEE_TABLE}.full_name as employee_name`,
      `${LEAVE_BALANCE_TABLE}.type_code`,
      `${LEAVE_TYPE_TABLE}.name as leave_type_name`
    )
    .leftJoin(
      `${LEAVE_TYPE_TABLE}`,
      `${LEAVE_BALANCE_TABLE}.type_code`,
      `${LEAVE_TYPE_TABLE}.type_code`
    )
    .leftJoin(
      `${EMPLOYEE_TABLE}`,
      `${LEAVE_BALANCE_TABLE}.employee_code`,
      `${EMPLOYEE_TABLE}.employee_code`
    )
    .where({ "leave_balances.employee_code": employeeCode });

/**
 * Get leave balance by ID.
 */
export const getLeaveBalanceById = async (
  id: number
): Promise<GetLeaveBalanceById | null> =>
  await db(LEAVE_BALANCE_TABLE)
    .select(
      `${LEAVE_BALANCE_TABLE}.*`,
      `${EMPLOYEE_TABLE}.full_name as employee_name`,
      `${LEAVE_TYPE_TABLE}.name as leave_type_name`
    )
    .leftJoin(
      `${LEAVE_TYPE_TABLE}`,
      `${LEAVE_BALANCE_TABLE}.type_code`,
      `${LEAVE_TYPE_TABLE}.type_code`
    )
    .leftJoin(
      `${EMPLOYEE_TABLE}`,
      `${LEAVE_BALANCE_TABLE}.employee_code`,
      `${EMPLOYEE_TABLE}.employee_code`
    )
    .where({ "leave_balances.id": id })
    .first();

/**
 * Get leave balance by Leave Balance Code.
 */
export const getLeaveBalanceByCode = async (
  code: string
): Promise<GetLeaveBalanceById | null> =>
  await db(LEAVE_BALANCE_TABLE)
    .select(
      `${LEAVE_BALANCE_TABLE}.*`,
      `${EMPLOYEE_TABLE}.full_name as employee_name`,
      `${LEAVE_TYPE_TABLE}.name as leave_type_name`
    )
    .leftJoin(
      `${LEAVE_TYPE_TABLE}`,
      `${LEAVE_BALANCE_TABLE}.type_code`,
      `${LEAVE_TYPE_TABLE}.type_code`
    )
    .leftJoin(
      `${EMPLOYEE_TABLE}`,
      `${LEAVE_BALANCE_TABLE}.employee_code`,
      `${EMPLOYEE_TABLE}.employee_code`
    )
    .where({ "leave_balances.balance_code": code })
    .first();

/**
 * Creates new leave balance.
 */
export const addLeaveBalances = async (
  data: CreateLeaveBalance
): Promise<LeaveBalance> => {
  const balance_code = await generateLeaveBalanceCode();
  const leaveBalanceToInsert = {
    ...data,
    balance_code,
  };
  const [id] = await db(LEAVE_BALANCE_TABLE).insert(leaveBalanceToInsert);
  return db(LEAVE_BALANCE_TABLE).where({ id }).first();
};

/**
 * Creates or increments the leave balance for ALL active employees.
 */
export const addBulkLeaveBalances = async (
  data: CreateBulkLeaveBalance
): Promise<number> => {
  const employees = await db(EMPLOYEE_TABLE)
    .select("employee_code", "employment_status")
    .where("employment_status", "aktif");

  if (employees.length === 0) {
    return 0;
  }
  let affectedCount = 0;
  let nextCodeNumber = await getNextStartingCodeNumber();

  await db.transaction(async (trx: Knex.Transaction) => {
    for (const employee of employees) {
      const employeeCode = employee.employee_code;

      // UPDATE the existing record (if it exists)
      const updated = await trx(LEAVE_BALANCE_TABLE)
        .where({
          employee_code: employeeCode,
          type_code: data.type_code,
          year: data.year,
        })
        .increment("balance", data.balance);

      if (updated === 0) {
        // Ensure the code number to always unique
        const balance_code = "JTC" + String(nextCodeNumber).padStart(7, "0");
        nextCodeNumber++;
        console.log(
          `balance_code: ${balance_code}. employee_code: ${employeeCode}. type_cde: ${data.type_code}. year: ${data.year}`
        );

        // INSERT the new record (if no update occurred)
        await trx(LEAVE_BALANCE_TABLE).insert({
          balance_code,
          employee_code: employeeCode,
          type_code: data.type_code,
          year: data.year,
          balance: data.balance,
        });
      }
      affectedCount++;
    }
  });

  return affectedCount;
};

/**
 * edit an existing leave balance record.
 */
export const editLeaveBalances = async (
  data: UpdateLeaveBalance
): Promise<LeaveBalance | null> => {
  const { id, ...updateData } = data;

  await db(LEAVE_BALANCE_TABLE).where({ id }).update(updateData);
  return db(LEAVE_BALANCE_TABLE).where({ id }).first();
};

/**
 * Remove existing leave balance
 */
export const removeLeaveBalances = async (id: number): Promise<number> =>
  await db(LEAVE_BALANCE_TABLE).where({ id }).delete();

/**
 * Deletes all leave balance records matching a specific type and year.
 */
export async function removeBulkLeaveBalances(
  type_code: string,
  year: number
): Promise<number> {
  return db(LEAVE_BALANCE_TABLE).where({ type_code, year }).del();
}
