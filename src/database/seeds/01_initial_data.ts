import knex from "knex";
import bcrypt from "bcrypt";

type Knex = knex.Knex;

const TABLE_KEYS = {
  USERS: "users",
  EMPLOYEES: "master_employees",
  POSITIONS: "master_positions",
  DIVISIONS: "master_divisions",
  DEPARTMENTS: "master_departments",
  LEAVE_TYPES: "master_leave_types",
  LEAVE_BALANCES: "leave_balances",
  PAYROLL_PERIODS: "payroll_periods",
  ATTENDANCES: "attendances",
  ATTENDANCE_SESSION_TABLE: "attendance_sessions",
};

export async function seed(knex: Knex): Promise<void> {
  // 1. Deletes ALL existing entries in reverse order of dependency
  await knex(TABLE_KEYS.ATTENDANCES).del();
  await knex(TABLE_KEYS.ATTENDANCE_SESSION_TABLE).del();
  await knex(TABLE_KEYS.USERS).del();
  await knex(TABLE_KEYS.LEAVE_BALANCES).del();
  await knex(TABLE_KEYS.EMPLOYEES).del();
  await knex(TABLE_KEYS.POSITIONS).del();
  await knex(TABLE_KEYS.DIVISIONS).del();
  await knex(TABLE_KEYS.DEPARTMENTS).del();
  await knex(TABLE_KEYS.LEAVE_TYPES).del();
  await knex(TABLE_KEYS.PAYROLL_PERIODS).del();

  // 2. Seed Departments
  await knex(TABLE_KEYS.DEPARTMENTS).insert([
    {
      department_code: "DPT0000001",
      name: "Technology",
      description:
        "Oversees all technical operations including software development, IT infrastructure, and system security.",
    },
    {
      department_code: "DPT0000002",
      name: "Human Resources",
      description:
        "Responsible for recruitment, employee relations, training programs, and maintaining organizational policies.",
    },
    {
      department_code: "DPT0000003",
      name: "Sales",
      description:
        "Drives company revenue through customer acquisition, business development, and account management.",
    },
    {
      department_code: "DPT0000004",
      name: "Finance",
      description:
        "Manages company financial planning, accounting, budgeting, and financial reporting activities.",
    },
  ]);

  // 3. Seed Divisions
  await knex(TABLE_KEYS.DIVISIONS).insert([
    // --- Technology Department ---
    {
      division_code: "DIV0000001",
      department_code: "DPT0000001",
      name: "Software Engineering",
      description:
        "Responsible for application development, code quality, and system architecture.",
    },
    {
      division_code: "DIV0000002",
      department_code: "DPT0000001",
      name: "IT Infrastructure",
      description:
        "Handles servers, networks, security, and IT support operations.",
    },

    // --- Human Resources Department ---
    {
      division_code: "DIV0000003",
      department_code: "DPT0000002",
      name: "Recruitment",
      description:
        "Manages talent sourcing, candidate screening, and interview processes.",
    },
    {
      division_code: "DIV0000004",
      department_code: "DPT0000002",
      name: "Employee Relations",
      description:
        "Handles employee engagement, conflict resolution, and HR policy compliance.",
    },

    // --- Sales Department ---
    {
      division_code: "DIV0000005",
      department_code: "DPT0000003",
      name: "Business Development",
      description:
        "Focuses on finding new business opportunities and strategic partnerships.",
    },
    {
      division_code: "DIV0000006",
      department_code: "DPT0000003",
      name: "Account Management",
      description:
        "Handles customer retention, account growth, and after-sales support.",
    },

    // --- Finance Department ---
    {
      division_code: "DIV0000007",
      department_code: "DPT0000004",
      name: "Accounting",
      description:
        "Responsible for bookkeeping, financial statements, and payroll processing.",
    },
    {
      division_code: "DIV0000008",
      department_code: "DPT0000004",
      name: "Budget & Planning",
      description:
        "Manages budgeting, long-term financial planning, and resource allocation.",
    },
  ]);

  // 4. Seed Positions
  await knex(TABLE_KEYS.POSITIONS).insert([
    // --- Software Engineering (DIV0000001) ---
    {
      position_code: "POS0000001",
      division_code: "DIV0000001",
      name: "Software Engineer",
      base_salary: 8000000.0,
      description:
        "Develops, maintains, and optimizes company software applications.",
    },
    {
      position_code: "POS0000002",
      division_code: "DIV0000001",
      name: "Senior Software Engineer",
      base_salary: 12000000.0,
      description:
        "Leads technical design, code reviews, and mentorship for engineering teams.",
    },
    {
      position_code: "POS0000003",
      division_code: "DIV0000001",
      name: "QA Engineer",
      base_salary: 7000000.0,
      description:
        "Ensures software quality through testing, automation, and validation.",
    },

    // --- IT Infrastructure (DIV0000002) ---
    {
      position_code: "POS0000004",
      division_code: "DIV0000002",
      name: "IT Support Specialist",
      base_salary: 6000000.0,
      description:
        "Provides technical support and resolves operational IT issues.",
    },
    {
      position_code: "POS0000005",
      division_code: "DIV0000002",
      name: "Network Administrator",
      base_salary: 9000000.0,
      description:
        "Maintains network systems, monitors connectivity, and manages security.",
    },

    // --- Recruitment (DIV0000003) ---
    {
      position_code: "POS0000006",
      division_code: "DIV0000003",
      name: "Recruitment Officer",
      base_salary: 6500000.0,
      description:
        "Handles sourcing, screening, and coordinating candidate interviews.",
    },
    {
      position_code: "POS0000007",
      division_code: "DIV0000003",
      name: "Talent Acquisition Specialist",
      base_salary: 8500000.0,
      description:
        "Leads end-to-end hiring strategies and maintains candidate pipelines.",
    },

    // --- Employee Relations (DIV0000004) ---
    {
      position_code: "POS0000008",
      division_code: "DIV0000004",
      name: "HR Officer",
      base_salary: 7000000.0,
      description:
        "Supports employee relations, engagement programs, and HR policy compliance.",
    },
    {
      position_code: "POS0000009",
      division_code: "DIV0000004",
      name: "HR Manager",
      base_salary: 13000000.0,
      description:
        "Oversees all HR functions including performance management and organizational development.",
    },

    // --- Business Development (DIV0000005) ---
    {
      position_code: "POS0000010",
      division_code: "DIV0000005",
      name: "Business Development Officer",
      base_salary: 7500000.0,
      description:
        "Identifies new business opportunities and develops strategic partnerships.",
    },
    {
      position_code: "POS0000011",
      division_code: "DIV0000005",
      name: "Business Development Manager",
      base_salary: 14000000.0,
      description: "Leads market expansion strategies and manages BD teams.",
    },

    // --- Account Management (DIV0000006) ---
    {
      position_code: "POS0000012",
      division_code: "DIV0000006",
      name: "Account Executive",
      base_salary: 7000000.0,
      description:
        "Manages client accounts, retains customers, and supports revenue growth.",
    },
    {
      position_code: "POS0000013",
      division_code: "DIV0000006",
      name: "Senior Account Manager",
      base_salary: 11000000.0,
      description:
        "Leads account operations and fosters long-term client relationships.",
    },

    // --- Accounting (DIV0000007) ---
    {
      position_code: "POS0000014",
      division_code: "DIV0000007",
      name: "Accountant",
      base_salary: 8000000.0,
      description:
        "Responsible for bookkeeping, payroll, and preparing financial reports.",
    },
    {
      position_code: "POS0000015",
      division_code: "DIV0000007",
      name: "Senior Accountant",
      base_salary: 12000000.0,
      description:
        "Supervises accounting operations and ensures financial compliance.",
    },

    // --- Budget & Planning (DIV0000008) ---
    {
      position_code: "POS0000016",
      division_code: "DIV0000008",
      name: "Financial Analyst",
      base_salary: 9000000.0,
      description:
        "Analyzes financial data and supports budgeting and forecasting processes.",
    },
    {
      position_code: "POS0000017",
      division_code: "DIV0000008",
      name: "Budget Officer",
      base_salary: 9500000.0,
      description:
        "Monitors company budget allocations and evaluates resource effectiveness.",
    },
  ]);

  // 6. Seed the User
  const password = process.env.DEFAULT_ADMIN_PASSWORD || "Password123!";
  const hashedPassword = await bcrypt.hash(password, 10);

  await knex(TABLE_KEYS.USERS).insert([
    {
      user_code: "USR0000001",
      email: "budi.pratama@company.com",
      password: hashedPassword, // placeholder hash
      role: "admin",
    },
    {
      user_code: "USR0000002",
      email: "siti.rahmawati@company.com",
      password: hashedPassword, // placeholder hash
      role: "employee",
    },
    {
      user_code: "USR0000003",
      email: "andi.setiawan@company.com",
      password: hashedPassword, // placeholder hash
      role: "employee",
    },
  ]);

  // 5. Seed the first Employee (who will be the Admin)
  await knex(TABLE_KEYS.EMPLOYEES).insert([
    {
      employee_code: "KWN0000001",
      // user_code: "USR0000001",
      position_code: "POS0000001", // Software Engineer
      full_name: "Budi Pratama",
      ktp_number: "3578123409876543",
      birth_place: "Surabaya",
      birth_date: "1997-08-15",
      gender: "laki-laki",
      address: "Jl. Kenanga No. 24, Surabaya, Jawa Timur",
      contact_phone: "081234567890",
      religion: "Islam",
      maritial_status: "Single",
      join_date: "2024-11-20",
      employment_status: "aktif",
      education: "S1 Informatika",
      blood_type: "O",
      profile_picture: null,
      bpjs_ketenagakerjaan: "230987654321",
      bpjs_kesehatan: "120987654321",
      npwp: "54.321.987.4-123.000",
      bank_account: "BCA 1234567890",
    },

    {
      employee_code: "KWN0000002",
      user_code: "USR0000002",
      position_code: "POS0000006", // Recruitment Officer
      full_name: "Siti Rahmawati",
      ktp_number: "3578012345678912",
      birth_place: "Malang",
      birth_date: "1995-03-28",
      gender: "perempuan",
      address: "Jl. Melati No. 3, Malang, Jawa Timur",
      contact_phone: "082345678912",
      religion: "Islam",
      maritial_status: "Married",
      join_date: "2023-07-10",
      employment_status: "aktif",
      education: "S1 Psikologi",
      blood_type: "A",
      profile_picture: null,
      bpjs_ketenagakerjaan: "230123987654",
      bpjs_kesehatan: "120123987654",
      npwp: "45.678.234.9-543.000",
      bank_account: "Mandiri 9876543210",
    },

    {
      employee_code: "KWN0000003",
      user_code: "USR0000003",
      position_code: "POS0000014", // Accountant
      full_name: "Andi Setiawan",
      ktp_number: "3578456712345678",
      birth_place: "Jakarta",
      birth_date: "1992-12-05",
      gender: "laki-laki",
      address: "Jl. Anggrek No. 56, Jakarta Selatan",
      contact_phone: "083212345678",
      religion: "Kristen",
      maritial_status: "Married",
      join_date: "2022-01-17",
      employment_status: "aktif",
      education: "S1 Akuntansi",
      blood_type: "B",
      profile_picture: null,
      bpjs_ketenagakerjaan: "239876543210",
      bpjs_kesehatan: "129876543210",
      npwp: "12.987.654.3-210.000",
      bank_account: "BRI 3344556677",
    },
  ]);

  // 6. Seed Leave Types (Essential for Leave Balance API)
  await knex(TABLE_KEYS.LEAVE_TYPES).insert([
    {
      name: "Cuti Tahunan",
      type_code: "TCT0000001",
      deduction: 10000,
      description: "Cuti Tahunan Karyawan",
    },
    {
      name: "Cuti Sakit",
      type_code: "TCT0000002",
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
