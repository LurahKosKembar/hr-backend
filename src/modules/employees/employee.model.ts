import { db } from "@database/connection.js";
import {
  DEPARTMENT_TABLE,
  DIVISION_TABLE,
  EMPLOYEE_TABLE,
  OFFICE_TABLE,
  POSITION_TABLE,
} from "@constants/database.js";
import {
  CreateEmployee,
  GetAllEmployee,
  UpdateEmployee,
  Employee,
  GetEmployeeById,
  UpdateEmployeeByCode,
} from "./employee.types.js";

/**
 * Function for generating employee code
 */
async function generateEmployeeCode() {
  const PREFIX = "KWN";
  const PAD_LENGTH = 7;

  const lastRow = await db(EMPLOYEE_TABLE)
    .select("employee_code")
    .orderBy("id", "desc")
    .first();

  if (!lastRow) {
    return PREFIX + String(1).padStart(PAD_LENGTH, "0");
  }

  const lastCode = lastRow.employee_code;
  const lastNumber = parseInt(lastCode.replace(PREFIX, ""), 10);
  const newNumber = lastNumber + 1;
  return PREFIX + String(newNumber).padStart(PAD_LENGTH, "0");
}

/**
 * Get all master employees.
 */
export const getAllMasterEmployees = async (): Promise<GetAllEmployee[]> =>
  await db(EMPLOYEE_TABLE)
    .select(
      `${EMPLOYEE_TABLE}.id`,
      `${EMPLOYEE_TABLE}.employee_code`,
      `${EMPLOYEE_TABLE}.full_name`,
      `${EMPLOYEE_TABLE}.join_date`,
      `${EMPLOYEE_TABLE}.position_code`,
      `${EMPLOYEE_TABLE}.employment_status`,

      // Office fields
      `${OFFICE_TABLE}.office_code`,
      `${OFFICE_TABLE}.name as office_name`,

      // Position fields
      `${POSITION_TABLE}.position_code`,
      `${POSITION_TABLE}.name as position_name`,

      // Division fields
      `${DIVISION_TABLE}.division_code`,
      `${DIVISION_TABLE}.name as division_name`,

      // Department fields
      `${DEPARTMENT_TABLE}.department_code`,
      `${DEPARTMENT_TABLE}.name as department_name`
    )
    .leftJoin(
      `${POSITION_TABLE}`,
      `${EMPLOYEE_TABLE}.position_code`,
      `${POSITION_TABLE}.position_code`
    )
    .leftJoin(
      `${DIVISION_TABLE}`,
      `${POSITION_TABLE}.division_code`,
      `${DIVISION_TABLE}.division_code`
    )
    .leftJoin(
      `${DEPARTMENT_TABLE}`,
      `${DIVISION_TABLE}.department_code`,
      `${DEPARTMENT_TABLE}.department_code`
    )
    .leftJoin(
      `${OFFICE_TABLE}`,
      `${EMPLOYEE_TABLE}.office_code`,
      `${OFFICE_TABLE}.office_code`
    );

/**
 * Get employee by ID.
 */
export const getMasterEmployeesById = async (
  id: number
): Promise<GetEmployeeById | null> =>
  await db(EMPLOYEE_TABLE)
    .select(
      `${EMPLOYEE_TABLE}.*`,

      // Office fields
      `${OFFICE_TABLE}.name as office_name`,

      // Position fields
      `${POSITION_TABLE}.position_code`,
      `${POSITION_TABLE}.name as position_name`,

      // Division fields
      `${DIVISION_TABLE}.division_code as division_code`,
      `${DIVISION_TABLE}.name as division_name`,

      // Department fields
      `${DEPARTMENT_TABLE}.department_code as department_code`,
      `${DEPARTMENT_TABLE}.name as department_name`
    )
    .leftJoin(
      `${POSITION_TABLE}`,
      `${EMPLOYEE_TABLE}.position_code`,
      `${POSITION_TABLE}.position_code`
    )
    .leftJoin(
      `${DIVISION_TABLE}`,
      `${POSITION_TABLE}.division_code`,
      `${DIVISION_TABLE}.division_code`
    )
    .leftJoin(
      `${DEPARTMENT_TABLE}`,
      `${DIVISION_TABLE}.department_code`,
      `${DEPARTMENT_TABLE}.department_code`
    )
    .leftJoin(
      `${OFFICE_TABLE}`,
      `${EMPLOYEE_TABLE}.office_code`,
      `${OFFICE_TABLE}.office_code`
    )
    .where({ "master_employees.id": id })
    .first();

/**
 * Get employee by employee code.
 */
export const getMasterEmployeesByCode = async (
  code: string
): Promise<GetEmployeeById | null> =>
  await db(EMPLOYEE_TABLE)
    .select(
      `${EMPLOYEE_TABLE}.*`,

      // Office fields
      `${OFFICE_TABLE}.name as office_name`,

      // Position fields
      `${POSITION_TABLE}.position_code`,
      `${POSITION_TABLE}.name as position_name`,

      // Division fields
      `${DIVISION_TABLE}.division_code as division_code`,
      `${DIVISION_TABLE}.name as division_name`,

      // Department fields
      `${DEPARTMENT_TABLE}.department_code as department_code`,
      `${DEPARTMENT_TABLE}.name as department_name`
    )
    .leftJoin(
      `${POSITION_TABLE}`,
      `${EMPLOYEE_TABLE}.position_code`,
      `${POSITION_TABLE}.position_code`
    )
    .leftJoin(
      `${DIVISION_TABLE}`,
      `${POSITION_TABLE}.division_code`,
      `${DIVISION_TABLE}.division_code`
    )
    .leftJoin(
      `${DEPARTMENT_TABLE}`,
      `${DIVISION_TABLE}.department_code`,
      `${DEPARTMENT_TABLE}.department_code`
    )
    .leftJoin(
      `${OFFICE_TABLE}`,
      `${EMPLOYEE_TABLE}.office_code`,
      `${OFFICE_TABLE}.office_code`
    )
    .where({ "master_employees.employee_code": code })
    .first();

/**
 * Get employee by user code.
 */
export const getMasterEmployeesByUserCode = async (
  userCode: string
): Promise<{ employee_code: string } | null> =>
  await db(EMPLOYEE_TABLE)
    .select("employee_code")
    .where({ user_code: userCode })
    .first();

/**
 * Creates new employee.
 */
export const addMasterEmployees = async (
  data: CreateEmployee
): Promise<Employee> => {
  const employee_code = await generateEmployeeCode();
  const employeeToInsert = {
    ...data,
    employee_code,
  };
  const [id] = await db(EMPLOYEE_TABLE).insert(employeeToInsert);
  return db(EMPLOYEE_TABLE).where({ id }).first();
};

/**
 * edit an existing position record.
 */
export const editMasterEmployees = async (
  data: UpdateEmployee
): Promise<Employee | null> => {
  const { id, ...updateData } = data;

  await db(EMPLOYEE_TABLE).where({ id }).update(updateData);
  return db(EMPLOYEE_TABLE).where({ id }).first();
};

/**
 * edit an existing position record by code.
 */
export const editMasterEmployeesByCode = async (
  data: UpdateEmployeeByCode
): Promise<Employee | null> => {
  const { employee_code, ...updateData } = data;

  await db(EMPLOYEE_TABLE).where({ employee_code }).update(updateData);
  return db(EMPLOYEE_TABLE).where({ employee_code }).first();
};

/**
 * Remove existing employee
 */
export const removeMasterEmployees = async (id: number): Promise<number> =>
  await db(EMPLOYEE_TABLE).where({ id }).delete();

/**
 * Get Total Current Employee
 */
export const totalMasterEmployees = async (): Promise<number> => {
  const [totalMasterEmployeeResult] = await db(EMPLOYEE_TABLE).count(
    "id as total_employees"
  );

  const totalMasterEmployees = parseInt(
    String(totalMasterEmployeeResult.total_employees || 0),
    10
  );
  return totalMasterEmployees;
};
