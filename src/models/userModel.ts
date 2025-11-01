import { db } from "@core/config/knex.js";
import { CreateUserData, UpdateUserData } from "types/userTypes.js";

interface User {
  id: number;
  email: string;
  password: string;
  employee_id: number;
  role: "admin" | "employee";
  created_at?: Date;
  updated_at?: Date;
}

const USER_TABLE = "users";

/**
 * Get all user.
 */
export const getAllUsers = async (): Promise<User[]> =>
  await db(USER_TABLE).select("*");

/**
 * Get user by ID.
 */
export const getUsersById = async (id: number): Promise<User | null> =>
  await db(USER_TABLE).where({ id }).first();

/**
 * Creates new user.
 */
export const addUsers = async (
  data: CreateUserData
): Promise<Omit<User, "password">> => {
  const [id] = await db(USER_TABLE).insert(data);

  return db(USER_TABLE)
    .where({ id })
    .select(["id", "email", "employee_id", "role"])
    .first();
};

/**
 * edit an existing user record.
 */
export const editUsers = async ({
  id,
  email,
  password,
  employee_id,
  role,
}: UpdateUserData): Promise<Omit<User, "password"> | null> => {
  await db(USER_TABLE).where({ id }).update({
    email,
    password,
    employee_id,
    role,
    updated_at: new Date(),
  });
  return db(USER_TABLE)
    .where({ id })
    .select(["id", "email", "employee_id", "role"])
    .first();
};

/**
 * Remove existing user
 */
export async function removeUsers(id: number): Promise<number> {
  return db(USER_TABLE).where({ id }).delete();
}
