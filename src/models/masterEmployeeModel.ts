import { db } from "@core/config/knex.js";
import { CreateEmployeeData, UpdateEmployeeData } from "types/employeeTypes.js";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  contact_phone: string | null | undefined;
  address: string | null | undefined;
  join_date: string;
  position_id: number;
  created_at?: Date;
  updated_at?: Date;
}

const EMPLOYEE_TABLE = "master_employees";

/**
 * Get all master employee.
 */
export const getAllMasterEmployees = async (): Promise<Employee[]> =>
  await db(EMPLOYEE_TABLE).select("*");

/**
 * Get employee by ID.
 */
export const getMasterEmployeesById = async (
  id: number
): Promise<Employee | null> => await db(EMPLOYEE_TABLE).where({ id }).first();

/**
 * Creates new employee.
 */
export const addMasterEmployees = async (
  data: CreateEmployeeData
): Promise<Employee> => {
  const [id] = await db(EMPLOYEE_TABLE).insert(data);

  return db(EMPLOYEE_TABLE).where({ id }).first();
};

/**
 * edit an existing employee record.
 */
export const editMasterEmployees = async ({
  id,
  address,
  contact_phone,
  first_name,
  last_name,
  position_id,
}: UpdateEmployeeData): Promise<Employee | null> => {
  await db(EMPLOYEE_TABLE).where({ id }).update({
    first_name,
    last_name,
    address,
    contact_phone,
    position_id,
    updated_at: new Date(),
  });
  return db(EMPLOYEE_TABLE).where({ id }).first();
};

/**
 * Remove existing mesin
 */
export async function removeMasterEmployees(id: number): Promise<number> {
  return db(EMPLOYEE_TABLE).where({ id }).delete();
}
