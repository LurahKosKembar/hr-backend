// Represents a single payroll record from the database
export interface Payroll {
  id: number;
  payroll_period_id: number;
  employee_id: number;
  base_salary: number;
  total_work_days: number;
  total_leave_days: number;
  total_deductions: number;
  net_salary: number;
  generated_at: string; // ISO date string (from datetime)
  status: "draft" | "finalized" | "paid";
  created_at: string;
  updated_at: string;
}

// Represents the body when creating a new payroll entry
export interface CreatePayrollData {
  payroll_period_id: number;
  employee_id: number;
  base_salary: number;
  total_work_days: number;
  total_leave_days: number;
  total_deductions?: number; // Optional, default = 0
  net_salary: number;
  status?: "draft" | "finalized" | "paid"; // Optional, default = "draft"
}

// Data required for the Bulk Grant Operation for the payroll
export interface BulkGrantPayrollData {
  payroll_period_id: number;
}

// Represents data for updating a payroll record
export interface UpdatePayrollData {
  id: number;
  base_salary?: number;
  total_deductions?: number;
  status?: "draft" | "finalized" | "paid";
}
