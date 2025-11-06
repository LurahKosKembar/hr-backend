import knex from "knex";
import bcrypt from "bcrypt";

type Knex = knex.Knex;

const TABLE_KEYS = {
  USERS: "users",
  EMPLOYEES: "master_employees",
  POSITIONS: "master_positions",
  DEPARTMENTS: "master_departments",
  LEAVE_TYPES: "master_leave_types",
  LEAVE_BALANCES: "leave_balances",
  PAYROLL_PERIODS: "payroll_periods",
};

export async function seed(knex: Knex): Promise<void> {
  // 1. Deletes ALL existing entries in reverse order of dependency
  await knex(TABLE_KEYS.USERS).del();
  await knex(TABLE_KEYS.LEAVE_BALANCES).del();
  await knex(TABLE_KEYS.EMPLOYEES).del();
  await knex(TABLE_KEYS.POSITIONS).del();
  await knex(TABLE_KEYS.DEPARTMENTS).del();
  await knex(TABLE_KEYS.LEAVE_TYPES).del();

  // 2. Seed Departments
  const [techDeptId] = await knex(TABLE_KEYS.DEPARTMENTS).insert({
    name: "Technology",
    department_code: "TECH",
  });
  const [hrDeptId] = await knex(TABLE_KEYS.DEPARTMENTS).insert({
    name: "Human Resources",
    department_code: "HR",
  });
  const [salesDeptId] = await knex(TABLE_KEYS.DEPARTMENTS).insert({
    name: "Sales",
    department_code: "SALES",
  });
  const [financeDeptId] = await knex(TABLE_KEYS.DEPARTMENTS).insert({
    name: "Finance",
    department_code: "FIN",
  });

  // 3. Seed Positions
  const [backendPosId] = await knex(TABLE_KEYS.POSITIONS).insert({
    name: "Backend Developer",
    department_id: techDeptId,
    position_code: "BDEV",
    base_salary: 8000000,
  });

  const [hrPosId] = await knex(TABLE_KEYS.POSITIONS).insert({
    name: "HR Specialist",
    department_id: hrDeptId,
    position_code: "HRSP",
    base_salary: 6000000,
  });

  const [salesPosId] = await knex(TABLE_KEYS.POSITIONS).insert({
    name: "Sales Associate",
    department_id: salesDeptId,
    position_code: "SALS",
    base_salary: 5500000,
  });

  const [financePosId] = await knex(TABLE_KEYS.POSITIONS).insert({
    name: "Accountant",
    department_id: financeDeptId,
    position_code: "ACCT",
    base_salary: 7000000,
  });

  const [frontendPosId] = await knex(TABLE_KEYS.POSITIONS).insert({
    name: "Frontend Developer",
    department_id: techDeptId,
    position_code: "FDEV",
    base_salary: 8000000,
  });

  // 4. Seed the first Employee (who will be the Admin)
  const [adminEmployeeId] = await knex(TABLE_KEYS.EMPLOYEES).insert({
    first_name: "System",
    last_name: "Admin",
    contact_phone: "081234567890",
    address: "Company HQ, Jakarta",
    join_date: "2023-01-15",
    position_id: backendPosId,
  });

  const [budiEmployeeId] = await knex(TABLE_KEYS.EMPLOYEES).insert({
    first_name: "Budi",
    last_name: "Santoso",
    contact_phone: "08111222333",
    address: "Jl. Merdeka 17, Bandung",
    join_date: "2023-03-10",
    position_id: hrPosId,
  });

  const [aliceEmployeeId] = await knex(TABLE_KEYS.EMPLOYEES).insert({
    first_name: "Alice",
    last_name: "Wijaya",
    contact_phone: "08144556677",
    address: "Jl. Gajah Mada 22, Surabaya",
    join_date: "2023-05-20",
    position_id: salesPosId,
  });

  const [charlieEmployeeId] = await knex(TABLE_KEYS.EMPLOYEES).insert({
    first_name: "Charlie",
    last_name: "Lee",
    contact_phone: "08188990011",
    address: "Jl. Sudirman 5, Jakarta",
    join_date: "2023-02-01",
    position_id: financePosId,
  });

  const [davidEmployeeId] = await knex(TABLE_KEYS.EMPLOYEES).insert({
    first_name: "David",
    last_name: "Kim",
    contact_phone: "08122334455",
    address: "Jl. Diponegoro 8, Yogyakarta",
    join_date: "2024-01-10",
    position_id: frontendPosId,
  });

  const [cindyAlyaEmployeeId] = await knex(TABLE_KEYS.EMPLOYEES).insert({
    first_name: "Cindy",
    last_name: "Alya",
    contact_phone: "08122334499",
    address: "Jl. Diponegoro 9, Yogyakarta",
    join_date: "2024-01-10",
    position_id: frontendPosId,
  });

  const [johnDoeEmployeeId] = await knex(TABLE_KEYS.EMPLOYEES).insert({
    first_name: "John",
    last_name: "Doe",
    contact_phone: "08122334477",
    address: "Jl. Diponegoro 11, Yogyakarta",
    join_date: "2024-01-10",
    position_id: hrPosId,
  });

  // 5. Seed the User
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Password123!";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await knex(TABLE_KEYS.USERS).insert([
    {
      email: "admin@marstech.com",
      password: hashedPassword,
      role: "admin",
      employee_id: adminEmployeeId,
    },
    {
      email: "budi.santoso@marstech.com",
      password: hashedPassword, // Re-use same hash for easy testing
      role: "employee",
      employee_id: budiEmployeeId,
    },
    {
      email: "alice.wijaya@marstech.com",
      password: hashedPassword,
      role: "employee",
      employee_id: aliceEmployeeId,
    },
    {
      email: "charlie.lee@marstech.com",
      password: hashedPassword,
      role: "employee",
      employee_id: charlieEmployeeId,
    },
    {
      email: "david.kim@marstech.com",
      password: hashedPassword,
      role: "employee",
      employee_id: davidEmployeeId,
    },
    {
      email: "cindy.alya@marstech.com",
      password: hashedPassword,
      role: "employee",
      employee_id: cindyAlyaEmployeeId,
    },
    {
      email: "john.doe@marstech.com",
      password: hashedPassword,
      role: "employee",
      employee_id: johnDoeEmployeeId,
    },
  ]);

  // 6. Seed Leave Types (Essential for Leave Balance API)
  await knex(TABLE_KEYS.LEAVE_TYPES).insert([
    {
      name: "Annual Leave",
      deduction: 10000,
      description: "Cuti Tahunan Karyawan",
    },
    {
      name: "Sick Leave",
      deduction: 0,
      description: "Cuti Sakit (Wajib ada surat dokter)",
    },
  ]);

  // 6. Seed Payroll Periods
  await knex(TABLE_KEYS.PAYROLL_PERIODS).insert([
    {
      period_code: "PRD-JAN25",
      start_date: "2025-01-01",
      end_date: "2025-01-31",
    },
    {
      period_code: "PRD-FEB25",
      start_date: "2025-02-01",
      end_date: "2025-02-28",
    },
  ]);

  console.log("Database seeded successfully with initial data!");
}
