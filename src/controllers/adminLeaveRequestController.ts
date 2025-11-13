import { Request, Response } from "express";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import { appLogger } from "@utils/logger.js";
import { errorResponse, successResponse } from "@utils/response.js";
import {
  editLeaveRequestStatus,
  getAllLeaveRequests,
  getLeaveRequestById,
} from "@models/leaveRequestModel.js";
import { updateLeaveStatusSchema } from "@schemas/leaveRequestSchema.js";
// import { deductLeaveBalance } from "@models/leaveBalanceModel.js";
import { AuthenticatedRequest } from "@middleware/jwt.js";

/**
 * [GET] /leave-requests - Fetch all Leave Requests (Monitoring)
 */
export const fetchAllLeaveRequest = async (req: Request, res: Response) => {
  try {
    const requests = await getAllLeaveRequests();

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
 * [PUT] /leave-requests/:id/status - Approve or Reject a Leave Request
 */
export const updateLeaveRequestStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user!.id;
  const requestId = parseInt(req.params.id, 10);

  if (isNaN(requestId)) {
    return errorResponse(
      res,
      API_STATUS.BAD_REQUEST,
      "ID Permintaan Cuti tidak valid.",
      400
    );
  }

  try {
    // 2. Validation
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
    const { status: newStatus } = validation.data;

    // 3. Check if the request exists and is still pending
    const existingRequest = await getLeaveRequestById(requestId);
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

    // update request status
    const updatedRequest = await editLeaveRequestStatus({
      id: existingRequest.id,
      new_status: newStatus,
      approved_by_id: userId,
    });
    if (!updatedRequest) {
      return errorResponse(
        res,
        API_STATUS.NOT_FOUND,
        "Gagal menyetujui: Permintaan tidak ditemukan",
        409
      );
    }

    // TODO: update the logic deduction of leave balance
    // Deduct the leave balance if request approved
    // if (updatedRequest.status == "Approved") {
    //   await deductLeaveBalance(updatedRequest);
    // }

    // 5. Success Response
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
