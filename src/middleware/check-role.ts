import { Request, Response, NextFunction } from "express";
import { TokenPayload } from "../utils/jwt.js"; // Adjust path
import { errorResponse } from "@utils/response.js";
import { API_STATUS } from "@constants/general.js";
import { appLogger } from "@utils/logger.js";

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/**
 * Middleware function generator to check if the authenticated user has one of the allowed roles.
 */
export const checkRole =
  (allowedRoles: Array<TokenPayload["role"]>) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return errorResponse(
        res,
        API_STATUS.FAILED,
        "Akses Ditolak: Pengguna tidak terautentikasi atau peran (role) hilang.",
        401
      );
    }

    const userRole = req.user.role;

    // Check for Authorization (Role Check)
    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      appLogger.warn(
        `User ID ${req.user.id} with role '${userRole}' attempted to access restricted route.`
      );
      return errorResponse(
        res,
        API_STATUS.FAILED,
        "Akses Ditolak: Anda tidak memiliki izin yang diperlukan.",
        403
      );
    }
  };

export const isAdmin = checkRole(["admin"]);
export const isEmployee = checkRole(["employee"]);
export const isAdminOrEmployee = checkRole(["admin", "employee"]);
