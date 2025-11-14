import { Request, Response } from "express";
import { successResponse, errorResponse } from "@utils/response.js";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import { appLogger } from "@utils/logger.js";
import { generateToken } from "@utils/jwt.js";
import { loginSchema } from "@schemas/authSchema.js";
import { findUserByEmail } from "@models/authModel.js";
import { comparePassword } from "@utils/bcrypt.js";
import { AuthenticatedRequest } from "@middleware/jwt.js";
import { getMasterEmployeesByUserCode } from "@models/masterEmployeeModel.js";

/**
 * [POST] /api/v1/auth/login - Login User (Employee or Admin)
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    // validation check
    const validation = loginSchema.safeParse(req.body);
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

    // check wether the email exist or not
    const { email, password } = validation.data;
    const user = await findUserByEmail(email);
    if (!user) {
      return errorResponse(
        res,
        API_STATUS.UNAUTHORIZED,
        "Email atau password salah",
        401
      );
    }

    // check wether the password correct or wrong
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(
        res,
        API_STATUS.UNAUTHORIZED,
        "Email atau password salah",
        401
      );
    }

    // get employee code based on user code
    const employee = await getMasterEmployeesByUserCode(user.user_code);

    // generate token phase
    const userResponse = {
      id: user.id,
      email: user.email,
      user_code: user.user_code,
      employee_code: employee?.employee_code || null,
      role: user.role,
    };
    const token = await generateToken(userResponse);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Login berhasil",
      {
        token,
        user: userResponse,
      },
      200,
      RESPONSE_DATA_KEYS.AUTH
    );
  } catch (error) {
    appLogger.error(`Login Error: ${error}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [GET] /api/v1/auth/me - Get current logged-in user info
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userPayload = req.user;

    if (!userPayload) {
      return errorResponse(
        res,
        API_STATUS.UNAUTHORIZED,
        "Token tidak mengandung data user yang valid.",
        401
      );
    }

    const userResponse = {
      id: userPayload.id,
      email: userPayload.email,
      employee_id: userPayload.employee_id,
      role: userPayload.role,
    };

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data pengguna berhasil didapatkan",
      userResponse,
      200,
      RESPONSE_DATA_KEYS.USERS
    );
  } catch (error) {
    appLogger.error(`Error getProfile: ${error}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [DELETE] /api/v1/auth/logout - Logout User (Employee or Admin)
 */
export const logoutUser = async (req: Request, res: Response) => {
  res.cookie("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
  });

  return successResponse(
    res,
    API_STATUS.SUCCESS,
    "Logout berhasil. Sesi telah diakhiri.",
    null,
    200
  );
};
