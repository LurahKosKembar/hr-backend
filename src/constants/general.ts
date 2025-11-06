export const API_STATUS = {
  SUCCESS: "00",
  FAILED: "01",
  PENDING: "02",
  NOT_FOUND: "03",
  UNAUTHORIZED: "04",
  CONFLICT: "05",
  BAD_REQUEST: "99",
};

export const RESPONSE_DATA_KEYS = {
  // Master Data
  DEPARTMENTS: "master_departments",
  POSITIONS: "master_positions",
  EMPLOYEES: "master_employees",
  LEAVE_TYPES: "leave_types",
  USERS: "users",
  AUTH: "auth",

  // transaction Data
  ATTENDANCES: "attendances",
  ATTENDANCE_SESSIONS: "attendance_sessions",
  LEAVE_REQUESTS: "leave_requests",
  LEAVE_BALANCES: "leave_balances",
  PAYROLL_PERIODS: "payroll_periods",
  PAYROLLS: "payrolls",
};
