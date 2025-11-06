import { Request, Response, NextFunction } from "express";
import "dotenv/config";
import * as jose from "jose";
import { TokenPayload } from "../utils/jwt.js";
import { API_STATUS } from "@constants/general.js";
import { appLogger } from "@utils/logger.js";
import { errorResponse } from "@utils/response.js";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

interface JOSEError extends Error {
  code?: string;
}

/**
 * Token verification middleware
 */
export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    appLogger.error("FATAL: JWT_SECRET is not configured.");
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Konfigurasi server tidak lengkap.",
      500
    );
  }

  try {
    const header = req.headers["authorization"];
    const token =
      header && header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
      return errorResponse(
        res,
        API_STATUS.UNAUTHORIZED,
        "Akses Ditolak: Token tidak tersedia.",
        401
      );
    }

    const secretKey = new TextEncoder().encode(JWT_SECRET);

    const { payload } = await jose.jwtVerify(token, secretKey, {
      algorithms: ["HS512"],
    });

    req.user = payload as TokenPayload;
    next();
  } catch (err) {
    const joseError = err as JOSEError;

    appLogger.error(`JWT Verification Error:${joseError.message}`);

    if (joseError.code === "ERR_JWT_EXPIRED") {
      return errorResponse(
        res,
        API_STATUS.UNAUTHORIZED,
        "Token kedaluwarsa, silakan login kembali.",
        401
      );
    }
    if (
      joseError.code === "ERR_JWS_INVALID" ||
      joseError.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED"
    ) {
      return errorResponse(
        res,
        API_STATUS.UNAUTHORIZED,
        "Token tidak valid (tanda tangan salah atau format rusak).",
        401
      );
    }

    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server saat memverifikasi token.",
      500
    );
  }
};
