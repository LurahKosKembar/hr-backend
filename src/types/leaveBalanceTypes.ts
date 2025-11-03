export interface LeaveBalance {
  id: number;
  employee_id: number;
  leave_type_id: number;
  balance: number;
  year: number;
  created_at?: Date;
  updated_at?: Date;
}

// Data required for the Bulk Grant operation (applies to all employees)
export interface BulkGrantData {
  leave_type_id: number;
  amount: number; // Amount to add or set initially
  year: number;
}

// Data required for the Specific Update operation (single employee)
export interface SpecificUpdateData {
  employee_id: number;
  leave_type_id: number;
  amount: number; // The absolute new balance
  year: number;
}

// Data returned for the Employee GET request (includes leave type name)
export interface EmployeeBalanceReport extends LeaveBalance {
  leave_type_name: string;
}

// This represents one row in the comprehensive Admin report
export interface LeaveBalanceReport extends LeaveBalance {
  employee_full_name: string;
  position_name: string;
  department_name: string;
  leave_type_name: string;
}
