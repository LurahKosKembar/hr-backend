import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response.js";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import {
  addUsers,
  editUsers,
  getAllUsers,
  getUsersById,
  removeUsers,
} from "@models/userModel.js";
import { appLogger } from "@utils/logger.js";
import { addUsersSchema, updateUsersSchema } from "@schemas/userSchema.js";
import { hashPassword } from "@utils/bcrypt.js";
import { DatabaseError } from "types/errorTypes.js";

/**
 * [GET] /-users - Fetch all Users
 */
export const fetchAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data User berhasil di dapatkan",
      users,
      200,
      RESPONSE_DATA_KEYS.USERS
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching users:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [GET] /-users/:id - Fetch User by id
 */
export const fetchUsersById = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID User tidak valid.",
        400
      );
    }

    const users = await getUsersById(id);

    if (!users) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data User tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data User berhasil didapatkan",
      users,
      200,
      RESPONSE_DATA_KEYS.USERS
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching users:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [POST] /-users - Create a new User
 */
export const createUsers = async (req: Request, res: Response) => {
  try {
    const validation = addUsersSchema.safeParse(req.body);

    if (!validation.success) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "Validasi gagal",
        400,
        validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        }))
      );
    }

    const { email, password, role, employee_id } = validation.data;
    const hashedPassword = await hashPassword(password);

    const Users = await addUsers({
      email,
      password: hashedPassword,
      role,
      employee_id,
    });

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data user berhasil dibuat",
      Users,
      201,
      RESPONSE_DATA_KEYS.USERS
    );
  } catch (error) {
    const dbError = error as DatabaseError;

    if (
      // Specific MySQL/MariaDB duplicate entry code
      dbError.code === "ER_DUP_ENTRY" ||
      dbError.errno === 1062
    ) {
      const errorMessage = dbError.sqlMessage || dbError.message;

      // Check for duplicate email entry
      if (
        errorMessage &&
        (errorMessage.includes("email") || errorMessage.includes("idx_email"))
      ) {
        appLogger.warn("User creation failed: Duplicate email entry.");
        return errorResponse(
          res,
          API_STATUS.BAD_REQUEST,
          "Validasi gagal",
          400,
          [
            {
              field: "email",
              message:
                "Email yang dimasukkan sudah terdaftar. Silakan gunakan email lain.",
            },
          ]
        );
      }

      // Check for duplicate employee_id entry
      if (
        errorMessage &&
        (errorMessage.includes("employee_id") ||
          errorMessage.includes("uni_employee_id"))
      ) {
        return errorResponse(
          res,
          API_STATUS.BAD_REQUEST,
          "Validasi gagal",
          400,
          [
            {
              field: "employee_id",
              message:
                "Pegawai ini sudah memiliki akun login. Tidak dapat membuat akun ganda.",
            },
          ]
        );
      }
    }
    appLogger.error(`Error creating users:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [PUT] /-users/:id - Edit a User
 */
export const updateUsers = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID User tidak valid.",
        400
      );
    }

    // Validate request body
    const validation = updateUsersSchema.safeParse(req.body);
    if (!validation.success) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "Validasi gagal",
        400,
        validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        }))
      );
    }

    const validatedData = validation.data;
    const { email, password, role, employee_id } = validatedData;

    const Users = await editUsers({
      id,
      email,
      password,
      role,
      employee_id,
    });

    // Validate employee not found
    if (!Users) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data User tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data User berhasil diperbarui",
      Users,
      200,
      RESPONSE_DATA_KEYS.USERS
    );
  } catch (error) {
    appLogger.error(`Error editing users:${error}`);

    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [DELETE] /-users/:id - Delete a User
 */
export const destroyUsers = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID User tidak valid.",
        400
      );
    }

    const existing = await getUsersById(id);

    if (!existing) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data User tidak ditemukan",
        404
      );
    }

    await removeUsers(existing.id);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data User berhasil dihapus",
      null,
      200
    );
  } catch (error) {
    // Catch-all for other server errors
    appLogger.error(`Error editing users:${error}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};
