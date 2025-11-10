export interface Department {
  id: number;
  department_code: string;
  name: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface GetAllDepartment {
  id: number;
  department_code: string;
  name: string;
}

export interface CreateDepartment {
  name: string;
  description?: string;
}

export interface UpdateDepartment {
  id: number;
  name?: string;
  description?: string;
}
