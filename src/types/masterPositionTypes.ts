export interface Position {
  id: number;
  position_code: string;
  division_code: string;
  name: string;
  base_salary: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface GetPositionById extends Position {
  division_name: string;
  department_code: string;
  department_name: string;
}

export interface GetAllPosition {
  id: number;
  position_code: string;
  name: string;
  base_salary: number;
  division_code: string;
  division_name: string;
  department_code: string;
  department_name: string;
}

export interface CreatePosition {
  name: string;
  division_code: string;
  base_salary: number;
  description?: string;
}

export interface UpdatePosition {
  id: number;
  name?: string;
  division_code?: string;
  base_salary?: number;
  description?: string;
}
