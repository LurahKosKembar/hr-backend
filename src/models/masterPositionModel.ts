import { db } from "@core/config/knex.js";

interface Position {
  id: number;
  name: string;
  base_salary: number;
  department_id: number;
  created_at?: Date;
  updated_at?: Date;
}

const POSITION_TABLE = "master_positions";

/**
 * Get all master position.
 */
export const getAllMasterPositions = async (): Promise<Position[]> =>
  await db(POSITION_TABLE).select("*");

/**
 * Get position by ID.
 */
export const getMasterPositionsById = async (
  id: number
): Promise<Position | null> => await db(POSITION_TABLE).where({ id }).first();

/**
 * Creates new position.
 */
export const addMasterPositions = async ({
  name,
  position_code,
  base_salary,
  department_id,
}: {
  name: string;
  position_code: string;
  base_salary: number;
  department_id: number;
}): Promise<Position> => {
  const [id] = await db(POSITION_TABLE).insert({
    name,
    department_id,
    base_salary,
    position_code,
  });

  return db(POSITION_TABLE).where({ id }).first();
};

/**
 * edit an existing position record.
 */
export const editMasterPositions = async ({
  id,
  name,
  position_code,
  base_salary,
  department_id,
}: {
  id: number;
  name?: string;
  position_code?: string;
  base_salary?: number;
  department_id?: number;
}): Promise<Position | null> => {
  await db(POSITION_TABLE).where({ id }).update({
    name,
    department_id,
    base_salary,
    position_code,
    updated_at: db.fn.now(),
  });
  return db(POSITION_TABLE).where({ id }).first();
};

/**
 * Remove existing positions
 */
export async function removeMasterPositions(id: number): Promise<number> {
  return db(POSITION_TABLE).where({ id }).delete();
}
