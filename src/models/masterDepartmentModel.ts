import { db } from "@core/config/knex.js";
import { DEPARTMENT_TABLE } from "@constants/database.js";
import {
  CreateDepartment,
  Department,
  GetAllDepartment,
  UpdateDepartment,
} from "types/masterDepartmentTypes.js";

/**
 * Function for generating department code
 */
async function generateDepartmentCode() {
  const PREFIX = "DPT";
  const PAD_LENGTH = 7;

  const lastRow = await db(DEPARTMENT_TABLE)
    .select("department_code")
    .orderBy("id", "desc")
    .first();

  if (!lastRow) {
    return PREFIX + String(1).padStart(PAD_LENGTH, "0");
  }

  const lastCode = lastRow.department_code;
  const lastNumber = parseInt(lastCode.replace(PREFIX, ""), 10);
  const newNumber = lastNumber + 1;
  return PREFIX + String(newNumber).padStart(PAD_LENGTH, "0");
}

/**
 * Get all master department.
 */
export const getAllMasterDepartments = async (): Promise<GetAllDepartment[]> =>
  await db(DEPARTMENT_TABLE).select("id", "department_code", "name");

/**
 * Get department by ID.
 */
export const getMasterDepartmentsById = async (
  id: number
): Promise<Department | null> =>
  await db(DEPARTMENT_TABLE).where({ id }).first();

/**
 * Creates new department.
 */
export const addMasterDepartments = async (
  data: CreateDepartment
): Promise<Department> => {
  const { name, description } = data;
  const department_code = await generateDepartmentCode();

  const [id] = await db(DEPARTMENT_TABLE).insert({
    name,
    department_code,
    description,
  });

  return db(DEPARTMENT_TABLE).where({ id }).first();
};

/**
 * edit an existing department record.
 */
export const editMasterDepartments = async (
  data: UpdateDepartment
): Promise<Department | null> => {
  const { id, name, description } = data;

  await db(DEPARTMENT_TABLE)
    .where({ id })
    .update({ name, description, updated_at: new Date() });
  return db(DEPARTMENT_TABLE).where({ id }).first();
};

/**
 * Remove existing department
 */
export async function removeMasterDepartments(id: number): Promise<number> {
  return db(DEPARTMENT_TABLE).where({ id }).delete();
}
