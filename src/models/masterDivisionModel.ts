import { DIVISION_TABLE } from "@constants/database.js";
import { db } from "@core/config/knex.js";
import {
  CreateDivision,
  Division,
  GetAllDivision,
  UpdateDivision,
} from "types/masterDivisionTypes.js";

/**
 * Function for generating division code
 */
async function generateDivisionCode() {
  const PREFIX = "DVS";
  const PAD_LENGTH = 7;

  const lastRow = await db(DIVISION_TABLE)
    .select("division_code")
    .orderBy("id", "desc")
    .first();

  if (!lastRow) {
    return PREFIX + String(1).padStart(PAD_LENGTH, "0");
  }

  const lastCode = lastRow.division_code;
  const lastNumber = parseInt(lastCode.replace(PREFIX, ""), 10);
  const newNumber = lastNumber + 1;
  return PREFIX + String(newNumber).padStart(PAD_LENGTH, "0");
}

/**
 * Get all master division.
 */
export const getAllMasterDivision = async (): Promise<GetAllDivision[]> =>
  await db(DIVISION_TABLE)
    .select(
      "master_divisions.id",
      "master_divisions.division_code",
      "master_divisions.name",
      "master_divisions.department_code",
      "master_departments.name as department_name"
    )
    .leftJoin(
      "master_departments",
      "master_divisions.department_code",
      "master_departments.department_code"
    );

/**
 * Get division by ID.
 */
export const getMasterDivisionsById = async (
  id: number
): Promise<Division | null> => await db(DIVISION_TABLE).where({ id }).first();

/**
 * Creates new division.
 */
export const addMasterDivisions = async (
  data: CreateDivision
): Promise<Division> => {
  const { name, department_code, description } = data;
  const division_code = await generateDivisionCode();

  const [id] = await db(DIVISION_TABLE).insert({
    name,
    department_code,
    division_code,
    description,
  });

  return db(DIVISION_TABLE).where({ id }).first();
};

/**
 * edit an existing division record.
 */
export const editMasterDivisions = async (
  data: UpdateDivision
): Promise<Division | null> => {
  const { id, name, department_code, description } = data;

  await db(DIVISION_TABLE)
    .where({ id })
    .update({ name, department_code, description, updated_at: new Date() });
  return db(DIVISION_TABLE).where({ id }).first();
};

/**
 * Remove existing division
 */
export async function removeMasterDivision(id: number): Promise<number> {
  return db(DIVISION_TABLE).where({ id }).delete();
}
