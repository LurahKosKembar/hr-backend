import { db } from "@core/config/knex.js";
import { Payroll, UpdatePayrollData } from "types/payrollsTypes.js";
import { getTotalWorkDays } from "./attendanceModel.js";
import { Knex } from "knex";
import {
  getTotalDeductionAmount,
  getTotalLeaveDays,
} from "./leaveRequestModel.js";

const PAYROLLS_TABLE = "payrolls";
const EMPLOYEES_TABLE = "master_employees";
const POSITIONS_TABLE = "master_positions";

/**
 * Get all payroll.
 */
export const getAllPayrolls = async (): Promise<Payroll[]> =>
  await db(PAYROLLS_TABLE).select("*");

/**
 * Get payroll by ID.
 */
export const getPayrollById = async (id: number): Promise<Payroll | null> =>
  await db(PAYROLLS_TABLE).where({ id }).first();

/**
 * Bulk-generate payrolls for all active employees in a given payroll period.
 */
export const bulkGeneratePayrolls = async (
  payrollPeriodId: number
): Promise<number> => {
  // 1. Get payroll period
  const payrollPeriod = await db("payroll_periods")
    .where({ id: payrollPeriodId })
    .first();

  if (!payrollPeriod) throw new Error("Payroll period not found.");

  const { start_date, end_date } = payrollPeriod;

  // 2. Get all active employees with position salaries
  const employees = await db(EMPLOYEES_TABLE)
    .join(
      POSITIONS_TABLE,
      `${EMPLOYEES_TABLE}.position_id`,
      "=",
      `${POSITIONS_TABLE}.id`
    )
    .select(
      `${EMPLOYEES_TABLE}.id as employee_id`,
      `${POSITIONS_TABLE}.base_salary`
    );

  if (employees.length === 0) return 0;

  let processedCount = 0;

  await db.transaction(async (trx: Knex.Transaction) => {
    for (const emp of employees) {
      const { employee_id, base_salary } = emp;

      const total_work_days = await getTotalWorkDays(
        employee_id,
        start_date,
        end_date,
        trx
      );

      const total_leave_days = await getTotalLeaveDays(
        employee_id,
        start_date,
        end_date,
        trx
      );

      const total_deductions = await getTotalDeductionAmount(
        employee_id,
        start_date,
        end_date,
        trx
      );
      const net_salary = base_salary - total_deductions;

      const updated = await trx(PAYROLLS_TABLE)
        .where({
          payroll_period_id: payrollPeriodId,
          employee_id,
        })
        .update({
          base_salary,
          total_work_days,
          total_leave_days,
          total_deductions,
          net_salary,
          generated_at: trx.fn.now(),
          updated_at: trx.fn.now(),
        });

      if (updated === 0) {
        await trx(PAYROLLS_TABLE).insert({
          payroll_period_id: payrollPeriodId,
          employee_id,
          base_salary,
          total_work_days,
          total_leave_days,
          total_deductions,
          net_salary,
          generated_at: trx.fn.now(),
          status: "draft",
        });
      }

      processedCount++;
    }
  });

  return processedCount;
};

/**
 * edit an existing payroll if in draft status.
 */
export const editPayroll = async (
  data: UpdatePayrollData & { existingPayroll?: Payroll }
): Promise<Payroll | null> => {
  const { id, status, base_salary, total_deductions, existingPayroll } = data;

  const currentPayroll =
    existingPayroll ?? (await db(PAYROLLS_TABLE).where({ id }).first());

  const updatedBaseSalary = base_salary ?? currentPayroll.base_salary;
  const updatedTotalDeductions =
    total_deductions ?? currentPayroll.total_deductions;

  const net_salary = updatedBaseSalary - updatedTotalDeductions;

  await db(PAYROLLS_TABLE).where({ id }).update({
    status,
    base_salary,
    total_deductions,
    net_salary,
    updated_at: db.fn.now(),
  });
  return db(PAYROLLS_TABLE).where({ id }).first();
};

/**
 * Remove existing payroll
 */
export async function removePayroll(id: number): Promise<number> {
  return db(PAYROLLS_TABLE).where({ id }).delete();
}
