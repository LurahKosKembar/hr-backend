import { POSITION_TABLE } from "@constants/database.js";
import { db } from "@core/config/knex.js";
import {
  CreatePosition,
  GetAllPosition,
  Position,
  UpdatePosition,
} from "types/masterPositionTypes.js";

/**
 * Function for generating position code
 */
async function generatePositionCode() {
  const PREFIX = "PST";
  const PAD_LENGTH = 7;

  const lastRow = await db(POSITION_TABLE)
    .select("position_code")
    .orderBy("id", "desc")
    .first();

  if (!lastRow) {
    return PREFIX + String(1).padStart(PAD_LENGTH, "0");
  }

  const lastCode = lastRow.position_code;
  const lastNumber = parseInt(lastCode.replace(PREFIX, ""), 10);
  const newNumber = lastNumber + 1;
  return PREFIX + String(newNumber).padStart(PAD_LENGTH, "0");
}

/**
 * Get all master position.
 */
export const getAllMasterPositions = async (): Promise<GetAllPosition[]> =>
  await db("master_positions")
    .select(
      "master_positions.id",
      "master_positions.position_code",
      "master_positions.name as position_name",
      "master_positions.base_salary",
      "master_positions.division_code",

      // Division fields
      "master_divisions.division_code as division_code",
      "master_divisions.name as division_name",

      // Department fields
      "master_departments.department_code as department_code",
      "master_departments.name as department_name"
    )
    .leftJoin(
      "master_divisions",
      "master_positions.division_code",
      "master_divisions.division_code"
    )
    .leftJoin(
      "master_departments",
      "master_divisions.department_code",
      "master_departments.department_code"
    );

/**
 * Get position by ID.
 */
export const getMasterPositionsById = async (
  id: number
): Promise<Position | null> => await db(POSITION_TABLE).where({ id }).first();

/**
 * Creates new position.
 */
export const addMasterPositions = async (
  data: CreatePosition
): Promise<Position> => {
  const { name, division_code, base_salary, description } = data;
  const position_code = await generatePositionCode();

  const [id] = await db(POSITION_TABLE).insert({
    name,
    position_code,
    division_code,
    base_salary,
    description,
  });

  return db(POSITION_TABLE).where({ id }).first();
};

/**
 * edit an existing position record.
 */
export const editMasterPositions = async (
  data: UpdatePosition
): Promise<Position | null> => {
  const { id, name, division_code, base_salary, description } = data;
  const position_code = await generatePositionCode();

  await db(POSITION_TABLE).where({ id }).update({
    name,
    position_code,
    division_code,
    base_salary,
    description,
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
