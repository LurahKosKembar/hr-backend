export interface Attendance {
  id: number;
  employee_id: number;
  session_id: number;
  check_in_time: Date;
  check_out_time: Date | null;
  check_in_status: "in-time" | "late" | "absent";
  check_out_status: "in-time" | "early" | "overtime" | "missed";
  created_at?: Date;
  updated_at?: Date;
}

export interface CheckInPayload {
  employee_id: number;
  session_id: number;
  check_in_time: Date;
  check_in_status: "in-time" | "late" | "absent";
}

export interface CheckOutPayload {
  employee_id: number;
  check_out_time: Date;
  session_id: number;
  check_out_status: "in-time" | "early" | "overtime" | "missed";
}
