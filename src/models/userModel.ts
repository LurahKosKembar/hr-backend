import { EMPLOYEE_TABLE, USER_TABLE } from "@constants/database.js";
import { db } from "@core/config/knex.js";
import {
  CreateUserData,
  GetAllUser,
  UpdateUserData,
  User,
} from "types/userTypes.js";

/**
 * Function for generating user code
 */
async function generateUserCode() {
  const PREFIX = "USR";
  const PAD_LENGTH = 7;

  const lastRow = await db(USER_TABLE)
    .select("user_code")
    .orderBy("id", "desc")
    .first();

  if (!lastRow) {
    return PREFIX + String(1).padStart(PAD_LENGTH, "0");
  }

  const lastCode = lastRow.user_code;
  const lastNumber = parseInt(lastCode.replace(PREFIX, ""), 10);
  const newNumber = lastNumber + 1;
  return PREFIX + String(newNumber).padStart(PAD_LENGTH, "0");
}

/**
 * Get all user.
 */
export const getAllUsers = async (): Promise<GetAllUser[]> =>
  await db(USER_TABLE)
    .select(
      `${USER_TABLE}.id`,
      `${USER_TABLE}.user_code`,
      `${USER_TABLE}.email`,
      `${USER_TABLE}.role`,
      `${EMPLOYEE_TABLE}.full_name as employee_name`
    )
    .leftJoin(
      `${EMPLOYEE_TABLE}`,
      `${EMPLOYEE_TABLE}.user_code`,
      `${USER_TABLE}.user_code`
    );

/**
 * Get user by ID.
 */
export const getUsersById = async (
  id: number
): Promise<Omit<User, "password">> =>
  await db(USER_TABLE).where({ id }).select("*").first();

/**
 * Creates new user.
 */
export const addUsers = async (
  data: CreateUserData
): Promise<Omit<User, "password">> => {
  const user_code = await generateUserCode();
  const userToInsert = {
    email: data.email,
    password: data.password,
    role: data.role,
    user_code,
  };
  const [id] = await db(USER_TABLE).insert(userToInsert);
  return db(USER_TABLE).where({ id }).select("*").first();
};

/**
 * edit an existing user record.
 */
export const editUsers = async (
  data: UpdateUserData
): Promise<Omit<User, "password"> | null> => {
  const { id } = data;
  const userToUpdate = {
    email: data.email,
    password: data.password,
    role: data.role,
  };

  await db(USER_TABLE).where({ id }).update(userToUpdate);
  return db(USER_TABLE).where({ id }).select("*").first();
};

/**
 * Remove existing user
 */
export async function removeUsers(id: number): Promise<number> {
  return db(USER_TABLE).where({ id }).delete();
}
