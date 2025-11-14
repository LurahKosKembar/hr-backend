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
    // get the date, month, year from the query
    const { date, month, year } = req.query;
    const targetDate =
      typeof date === "string" && date.trim() !== "" ? date : formatDate();

    // parse the data to calculate the leave request of the month and year
    const now = new Date();
    const targetMonth = month ? parseInt(month as string) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year as string) : now.getFullYear();
    const totalLeaveRequest = await calculateTotalLeaveRequest(
      targetMonth,
      targetYear
    );

    // calculate the attendance for specific date
    const attendanceSession = await getAttendanceSessionsByDate(targetDate);
    const totalAttendance = attendanceSession
      ? await calculateTotalAttendances(targetDate, attendanceSession)
      : 0;

    // get the total employee in the system
    const totalEmployee = await totalMasterEmployees();

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
