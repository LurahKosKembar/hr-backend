import { LEAVE_TYPE_TABLE } from "@constants/database.js";
import { db } from "@core/config/knex.js";
import {
  CreateLeaveType,
  GetAllLeaveType,
  GetLeaveTypeById,
  LeaveType,
  UpdateLeaveType,
} from "types/masterLeaveTypes.js";

/**
 * Function for generating leave type code
 */
async function generateLeaveTypeCode() {
  const PREFIX = "TCI";
  const PAD_LENGTH = 7;

  const lastRow = await db(LEAVE_TYPE_TABLE)
    .select("type_code")
    .orderBy("id", "desc")
    .first();

  if (!lastRow) {
    return PREFIX + String(1).padStart(PAD_LENGTH, "0");
  }

  const lastCode = lastRow.type_code;
  const lastNumber = parseInt(lastCode.replace(PREFIX, ""), 10);
  const newNumber = lastNumber + 1;
  return PREFIX + String(newNumber).padStart(PAD_LENGTH, "0");
}

/**
 * Get all master leave type.
 */
export const getAllMasterLeaveTypes = async (): Promise<GetAllLeaveType[]> =>
  await db(LEAVE_TYPE_TABLE).select(
    "id",
    "type_code",
    "name",
    "deduction",
    "description"
  );

/**
 * Get leave type by ID.
 */
export const getMasterLeaveTypesById = async (
  id: number
): Promise<GetLeaveTypeById | null> =>
  await db(LEAVE_TYPE_TABLE).where({ id }).first();

/**
 * Creates new leave type.
 */
export const addMasterLeaveTypes = async (
  data: CreateLeaveType
): Promise<LeaveType> => {
  const type_code = await generateLeaveTypeCode();
  const leaveTypeToInsert = {
    ...data,
    type_code,
  };

  const [id] = await db(LEAVE_TYPE_TABLE).insert(leaveTypeToInsert);
  return db(LEAVE_TYPE_TABLE).where({ id }).first();
};

/**
 * edit an existing leave type record.
 */
export const editMasterLeaveTypes = async (
  data: UpdateLeaveType
): Promise<LeaveType | null> => {
  const { id, ...updateData } = data;

  await db(LEAVE_TYPE_TABLE).where({ id }).update(updateData);
  return db(LEAVE_TYPE_TABLE).where({ id }).first();
};

/**
 * Remove existing leave type
 */
export async function removeMasterLeaveTypes(id: number): Promise<number> {
  return db(LEAVE_TYPE_TABLE).where({ id }).delete();
}
