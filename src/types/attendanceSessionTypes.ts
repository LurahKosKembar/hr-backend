export interface AttendanceSession {
  id: number;
  date: string;
  status: "open" | "closed";
  open_time: string;
  cutoff_time: string;
  close_time: string;
  created_by: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface GetAttendanceById {
  id: number;
  date: string;
  status: "open" | "closed";
  open_time: string;
  cutoff_time: string;
  close_time: string;
  created_by: string;
  created_at: string;
  created_by_email: string;
  created_by_role: string;
  created_by_first_name: string;
  created_by_last_name: string;
}

export interface CreateAttendanceSessionData {
  date: string;
  status: "open" | "closed";
  open_time: string;
  cutoff_time: string;
  close_time: string;
  created_by: number;
}

export interface UpdateAttendanceSessionData {
  id: number;
  date?: string;
  status?: "open" | "closed";
  open_time?: string;
  cutoff_time?: string;
  close_time?: string;
}
