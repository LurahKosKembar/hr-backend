export interface LeaveBalance {
  id: number;
  balance_code: string;
  employee_code: string;
  type_code: string;
  balance: number;
  year: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface GetAllLeaveBalance {
  id: number;
  balance_code: string;
  balance: number;
  year: number;
  employee_code: string;
  employee_name: string;
  type_code: string;
  leave_type_name: string;
}

export interface GetLeaveBalanceById extends LeaveBalance {
  employee_name: string;
  leave_type_name: string;
}

export interface CreateLeaveBalance {
  employee_code: string;
  type_code: string;
  balance: number;
  year: number;
}

export interface CreateBulkLeaveBalance {
  type_code: string;
  balance: number;
  year: number;
}

export interface UpdateLeaveBalance {
  id: number;
  employee_code?: string;
  type_code?: string;
  balance?: number;
  year?: number;
}

// Data required for the Specific Update operation (single employee)
export interface SpecificUpdateData {
  employee_code: string;
  type_code: string;
  amount: number;
  year: number;
}

// This represents one row in the comprehensive Admin report
export interface LeaveBalanceReport extends LeaveBalance {
  employee_full_name: string;
  position_name: string;
  department_name: string;
  leave_type_name: string;
}
