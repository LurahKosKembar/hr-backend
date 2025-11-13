import { Request, Response } from "express";
import { API_STATUS, RESPONSE_DATA_KEYS } from "@constants/general.js";
import { errorResponse, successResponse } from "@utils/response.js";
import { appLogger } from "@utils/logger.js";
import { DatabaseError } from "types/errorTypes.js";
import {
  calculateTotalAttendances,
  calculateTotalLeaveRequest,
} from "@models/dashboardModel.js";
import { formatDate } from "@utils/formatDate.js";
import { getAttendanceSessionsByDate } from "@models/attendanceSessionModel.js";
import { totalMasterEmployees } from "@models/masterEmployeeModel.js";

/**
 * [GET] /metrics - Fetch admin data metrics
 */
export const getMetrics = async (req: Request, res: Response) => {
  try {
    // Handle query params (optional)
    const { date, month, year } = req.query;

    // Fallback to today's date using formatDate()
    const targetDate =
      typeof date === "string" && date.trim() !== "" ? date : formatDate();

    // Fetch attendance session for the target date
    const attendanceSession = await getAttendanceSessionsByDate(targetDate);

    // Calculate total attendance if session exists
    const totalAttendance = attendanceSession
      ? await calculateTotalAttendances(targetDate, attendanceSession)
      : 0;

    // Get total employees (now returns a number directly)
    const totalEmployee = await totalMasterEmployees();

    // Calculate total leave requests (monthly)
    const now = new Date();
    const targetMonth = month ? parseInt(month as string) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year as string) : now.getFullYear();

    const totalLeaveRequest = await calculateTotalLeaveRequest(
      targetMonth,
      targetYear
    );

    // TODO: Implement leave balance calculation
    // Calculate total leave balance for all type
    // const totalLeaveBalance = await calculateTotalLeaveBalance();

    // Send successful response
    return successResponse(
      res,
      API_STATUS.SUCCESS,
      "Berhasil mendapatkan data dashboard admin",
      {
        totalEmployee,
        totalLeaveRequest,
        totalAttendance,
        // totalLeaveBalance,
      },
      200,
      RESPONSE_DATA_KEYS.EMPLOYEES
    );
  } catch (error) {
    const dbError = error as DatabaseError;
    appLogger.error(`Error fetching admin dashboard metrics: ${dbError}`);
    return errorResponse(
      res,
      API_STATUS.FAILED,
      "Terjadi kesalahan pada server",
      500
    );
  }
};
