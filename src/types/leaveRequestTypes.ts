export type LeaveStatus = "Pending" | "Approved" | "Rejected";
export type ApproverId = number;

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: LeaveStatus;
  approved_by_id: ApproverId | null;
  approval_date: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateLeaveRequestData {
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason: string;
}

export interface UpdateLeaveStatusData {
  id: number;
  new_status: "Approved" | "Rejected";
  approved_by_id: number;
}
