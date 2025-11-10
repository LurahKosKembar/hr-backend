/**
 * Database Table Name Constants
 * * Centralizing table names here prevents magic strings throughout the codebase,
 * making maintenance (e.g., renaming a table) much simpler.
 */

// Core Tables
export const USER_TABLE = "users";
export const EMPLOYEE_TABLE = "master_employees";
export const POSITION_TABLE = "master_positions";
export const DIVISION_TABLE = "master_divisions";
export const DEPARTMENT_TABLE = "master_departments";

// Attendance Tables
export const ATTENDANCE_SESSION_TABLE = "attendance_sessions";
export const ATTENDANCE_TABLE = "attendances";

// Leave Management Tables
export const LEAVE_TYPE_TABLE = "master_leave_types";
export const LEAVE_BALANCE_TABLE = "leave_balances";
export const LEAVE_REQUEST_TABLE = "leave_requests";

// Payroll Tables
export const PAYROLL_PERIODS_TABLE = "payroll_periods";
export const PAYROLLS_TABLE = "payrolls";
