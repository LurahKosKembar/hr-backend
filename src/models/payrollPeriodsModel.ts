import { db } from "@core/config/knex.js";
import {
  CreatePayrollPeriodData,
  PayrollPeriod,
  UpdatePayrollPeriodStatus,
} from "types/payrollPeriodsTypes.js";

const PERIODS_TABLE = "payroll_periods";

/**
 * Get all payroll periods.
 */
export const getAllPayrollPeriods = async (): Promise<PayrollPeriod[]> =>
  await db(PERIODS_TABLE).select("*");

/**
 * Get payroll period by ID.
 */
export const getPayrollPeriodsById = async (
  id: number
): Promise<PayrollPeriod | null> =>
  await db(PERIODS_TABLE).where({ id }).first();

/**
 * Creates new payroll period.
 */
export const addPayrollPeriods = async (
  data: CreatePayrollPeriodData
): Promise<PayrollPeriod> => {
  const [id] = await db(PERIODS_TABLE).insert(data);

  return db(PERIODS_TABLE).where({ id }).first();
};

/**
 * Edit status of payroll periods
 */
export const editStatusPayrollPeriods = async (
  data: UpdatePayrollPeriodStatus
) => {
  const { id, status } = data;
  await db(PERIODS_TABLE).where({ id }).update({
    status,
  });
  return db(PERIODS_TABLE).where({ id }).first();
};

/**
 * Remove existing payroll periods
 */
export async function removePayrollPeriods(id: number): Promise<number> {
  return db(PERIODS_TABLE).where({ id }).delete();
}
