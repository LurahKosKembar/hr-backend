export interface LeaveRequest {
  id: number;
  request_code: string;
  employee_code: string;
  type_code: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  approved_by_user_code: string | null;
  approval_date: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface GetLeaveRequestById extends LeaveRequest {
  employee_name: string;
  type_name: string;
  approval_name: string;
}

export interface GetAllLeaveRequest {
  id: number;
  request_code: string;
  employee_code: string;
  type_code: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  approved_by_user_code: string | null;
  approval_date: Date | null;
  employee_name: string;
  type_name: string;
  approval_name: string;
}

export interface CreateLeaveRequest {
  employee_code: string;
  type_code: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
}

export interface UpdateLeaveRequest {
  id: number;
  type_code?: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
}

export interface UpdateLeaveStatusData {
  id: number;
  new_status: "Approved" | "Rejected";
  approved_by_user_code: string;
}
