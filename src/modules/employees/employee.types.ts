export interface Employee {
  id: number;
  employee_code: string;
  user_code: string;
  position_code: string;
  office_code: string;
  full_name: string;

  ktp_number: string | null;
  birth_place: string | null;
  birth_date: string | null;
  gender: "laki-laki" | "perempuan" | null;

  address: string | null;
  contact_phone: string | null;
  religion: string | null;
  maritial_status: string | null;

  join_date: string;
  resign_date: string | null;
  employment_status: string | null;
  education: string | null;
  blood_type: string | null;

  profile_picture: string | null;
  bpjs_ketenagakerjaan: string | null;
  bpjs_kesehatan: string | null;
  npwp: string | null;
  bank_account: string | null;

  created_at: string;
  updated_at: string;
}

export interface GetEmployeeById extends Employee {
  email: string;
  position_name: string;
  division_code: string;
  division_name: string;
  department_code: string;
  department_name: string;
}

export interface GetAllEmployee {
  id: number;
  full_name: string;
  employee_code: string;
  position_code: string;
  position_name: string;
  division_code: string;
  division_name: string;
  department_code: string;
  department_name: string;
  office_code: string;
  office_name: string;
  user_code: string;
  email: string;
  employment_status: "aktif" | "inaktif";
}

export interface CreateEmployee {
  // required fields
  user_code: string;
  position_code: string;
  office_code: string;
  full_name: string;
  join_date: string;

  // optional fields
  ktp_number?: string | null;
  birth_place?: string | null;
  birth_date?: string | null;
  gender?: "laki-laki" | "perempuan" | null;
  address?: string | null;
  contact_phone?: string | null;
  religion?: string | null;
  maritial_status?: string | null;
  resign_date?: string | null;
  employment_status?: "aktif" | "inaktif" | null;
  education?: string | null;
  blood_type?: string | null;
  profile_picture?: string | null;
  bpjs_ketenagakerjaan?: string | null;
  bpjs_kesehatan?: string | null;
  npwp?: string | null;
  bank_account?: string | null;
}

export interface UpdateEmployee {
  id: number;
  user_code?: string;
  position_code?: string;
  office_code?: string;
  full_name?: string;
  join_date?: string;

  // optional fields
  ktp_number?: string | null;
  birth_place?: string | null;
  birth_date?: string | null;
  gender?: "laki-laki" | "perempuan" | null;
  address?: string | null;
  contact_phone?: string | null;
  religion?: string | null;
  maritial_status?: string | null;
  resign_date?: string | null;
  employment_status?: "aktif" | "inaktif" | null;
  education?: string | null;
  blood_type?: string | null;
  profile_picture?: string | null;
  bpjs_ketenagakerjaan?: string | null;
  bpjs_kesehatan?: string | null;
  npwp?: string | null;
  bank_account?: string | null;
}

export interface UpdateEmployeeByCode {
  employee_code: string;
  position_code?: string;
  office_code?: string;
  full_name?: string;
  join_date?: string;

  // optional fields
  ktp_number?: string | null;
  birth_place?: string | null;
  birth_date?: string | null;
  gender?: "laki-laki" | "perempuan" | null;
  address?: string | null;
  contact_phone?: string | null;
  religion?: string | null;
  maritial_status?: string | null;
  resign_date?: string | null;
  employment_status?: "aktif" | "inaktif" | null;
  education?: string | null;
  blood_type?: string | null;
  profile_picture?: string | null;
  bpjs_ketenagakerjaan?: string | null;
  bpjs_kesehatan?: string | null;
  npwp?: string | null;
  bank_account?: string | null;
}
