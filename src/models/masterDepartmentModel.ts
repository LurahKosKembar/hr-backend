import { db } from "@core/config/knex.js";

interface Department {
  id: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

const DEPARTMENT_TABLE = "master_departments";

/**
 * Get all master department.
 */
export const getAllMasterDepartments = async (): Promise<Department[]> =>
  await db(DEPARTMENT_TABLE).select("*");

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
export const addMasterDepartments = async ({
  name,
}: {
  name: string;
}): Promise<Department> => {
  const [id] = await db(DEPARTMENT_TABLE).insert({ name });

  return db(DEPARTMENT_TABLE).where({ id }).first();
};

/**
 * edit an existing department record.
 */
export const editMasterDepartments = async ({
  name,
  id,
}: {
  name?: string;
  id: number;
}): Promise<Department | null> => {
  await db(DEPARTMENT_TABLE)
    .where({ id })
    .update({ name, updated_at: new Date() });
  return db(DEPARTMENT_TABLE).where({ id }).first();
};

/**
 * Remove existing mesin
 */
export async function removeMasterDepartments(id: number): Promise<number> {
  return db(DEPARTMENT_TABLE).where({ id }).delete();
}
