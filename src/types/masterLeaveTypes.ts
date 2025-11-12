export interface LeaveType {
  id: number;
  type_code: string;
  name: string;
  deduction: number;
  description: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface GetLeaveTypeById extends LeaveType {}

export interface GetAllLeaveType {
  id: number;
  type_code: string;
  name: string;
  deduction: number;
  description: string | null;
}

export interface CreateLeaveType {
  name: string;
  deduction: number;
  description?: string;
}

export interface UpdateLeaveType {
  id: number;
  name?: string;
  deduction?: number;
  description?: string;
}
