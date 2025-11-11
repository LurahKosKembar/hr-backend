export interface Division {
  id: number;
  division_code: string;
  department_code: string;
  name: string;
  description: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface GetDivisionById extends Division {
  department_name: string;
}

export interface GetAllDivision {
  id: number;
  division_code: string;
  department_code: string;
  department_name: string;
  name: string;
}

export interface CreateDivision {
  name: string;
  department_code: string;
  description?: string;
}

export interface UpdateDivision {
  id: number;
  name?: string;
  department_code?: string;
  description?: string;
}
