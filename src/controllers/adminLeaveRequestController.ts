import { Request, Response } from "express";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import { appLogger } from "@utils/logger.js";
import { errorResponse, successResponse } from "@utils/response.js";
import {
  editLeaveRequestStatus,
  getAllLeaveRequests,
  getLeaveRequestsById,
  removeLeaveRequest,
} from "@models/leaveRequestModel.js";
import { updateLeaveStatusSchema } from "@schemas/leaveRequestSchema.js";
import { deductLeaveBalance } from "@models/leaveBalanceModel.js";
import { AuthenticatedRequest } from "@middleware/jwt.js";

/**
 * [GET] /leave-requests - Fetch all Leave Requests
 * Accepts optional query parameter: ?type_code=TCT0000001&status=pending
 */
export const fetchAllLeaveRequest = async (req: Request, res: Response) => {
  try {
    // parsing query parameter
    const typeCode = req.query.type_code as string | undefined;
    const employeeCode = req.query.employee_code as string | undefined;
    const status = req.query.status as
      | "pending"
      | "approved"
      | "rejected"
      | undefined;

    const requests = await getAllLeaveRequests({
      typeCode,
      employeeCode,
      status,
    });
    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Daftar permintaan cuti berhasil didapatkan.",
      requests,
      200,
      RESPONSE_DATA_KEYS.LEAVE_REQUESTS
    );
  } catch (error) {
    appLogger.error(`Error fetching all leave requests:${error}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server saat mengambil permintaan cuti.",
      500
    );
  }
};

/**
 * [GET] /leave-request/:id - Fetch Leave Request by id
 */
export const fetchLeaveRequestById = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID Permintaan Cuti tidak valid.",
        400
      );
    }

    const leaveRequest = await getLeaveRequestsById(id);

    if (!leaveRequest) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Permintaan Cuti tidak ditemukan",
        404
      );
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Perminataan Cuti berhasil didapatkan",
      leaveRequest,
      200,
      RESPONSE_DATA_KEYS.LEAVE_REQUESTS
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching leave balances:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};

/**
 * [PUT] /leave-requests/:id/status - Approve or Reject a Leave Request
 */
export const updateLeaveRequestStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userCode = req.user!.user_code;
  const requestId = parseInt(req.params.id, 10);

  try {
    if (isNaN(requestId)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID Permintaan Cuti tidak valid.",
        400
      );
    }

    const validation = updateLeaveStatusSchema.safeParse(req.body);
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
    // Check if the request exists and is still pending
    const existingRequest = await getLeaveRequestsById(requestId);
    if (!existingRequest) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Permintaan Cuti tidak ditemukan.",
        404
      );
    }
    if (existingRequest.status !== "Pending") {
      return errorResponse(
        res,
        API_STATUS.CONFLICT,
        `Permintaan cuti sudah berstatus '${existingRequest.status}'. Keputusan tidak dapat diubah.`,
        409
      );
    }

    const { status: newStatus } = validation.data;
    const updatedRequest = await editLeaveRequestStatus({
      id: existingRequest.id,
      new_status: newStatus,
      approved_by_user_code: userCode,
    });
    if (!updatedRequest) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Gagal menyetujui: Permintaan tidak ditemukan",
        409
      );
    }

    // Deduct the leave balance if request approved
    if (updatedRequest.status == "Approved") {
      await deductLeaveBalance(updatedRequest);
    }

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      `Permintaan cuti berhasil di${newStatus === "Approved" ? "setujui" : "tolak"}.`,
      updatedRequest,
      200,
      RESPONSE_DATA_KEYS.LEAVE_REQUESTS
    );
  } catch (error) {
    // Assuming the service handles all integrity (balance, FK) errors and re-throws clean errors
    appLogger.error(
      `Error processing leave decision for request ${requestId}: ${error}`
    );

    // Handle custom service errors here if needed
    if (
      error instanceof Error &&
      error.message.includes("INSUFFICIENT_BALANCE")
    ) {
      return errorResponse(
        res,
        API_STATUS.CONFLICT,
        "Gagal menyetujui: Saldo cuti pegawai tidak mencukupi.",
        409
      );
    }

    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server saat memproses keputusan cuti.",
      500
    );
  }
};

/**
 * [DELETE] /leave-request/:id - Delete a leave request
 */
export const destroyLeaveRequest = async (req: Request, res: Response) => {
  try {
    // Validate and cast the ID params
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(
        res,
        API_STATUS.BAD_REQUEST,
        "ID Permintaan Cuti tidak valid.",
        400
      );
    }

    const existing = await getLeaveRequestsById(id);

    if (!existing) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Data Permintaan Cuti tidak ditemukan",
        404
      );
    }

    await removeLeaveRequest(existing.id);

    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Data Permintaan Cuti berhasil dihapus",
      null,
      200
    );
  } catch (error) {
    const dbError = error as unknown;
    appLogger.error(`Error fetching leave requests:${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};
