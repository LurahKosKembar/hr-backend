export interface User {
  id: number;
  user_code: string;
  email: string;
  role: "admin" | "employee";
  password: string;
  created_at: string;
  updated_at: string;
}

export interface GetAllUser {
  id: number;
  user_code: string;
  email: string;
  role: "admin" | "employee";
  employee_name: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  role: "admin" | "employee";
}

export interface UpdateUserData {
  id: number;
  email?: string;
  password?: string;
  role?: "admin" | "employee";
}
