import type { Knex } from "knex";

// Assuming Employee 1 is the admin/approver
// const APPROVER_ID = 1;

// interface LeaveRequestRow {
//   employee_id: number;
//   leave_type_id: number;
//   start_date: string;
//   end_date: string;
//   total_days: number;
//   reason: string;
//   status: "Pending" | "Approved" | "Rejected";
//   approved_by_id: number | null;
//   approval_date: string | null;
// }

export async function seed(knex: Knex): Promise<void> {
  // // Delete existing entries
  // await knex("leave_requests").del();
  //
  // // Define the current timestamp for approval_date
  // const now = new Date().toISOString().slice(0, 19).replace("T", " "); // YYYY-MM-DD HH:MM:SS format
  //
  // const rows: LeaveRequestRow[] = [
  //   // --- Leave 1: Employee 2 Annual Leave (Matches null attendance on Jan 15) ---
  //   {
  //     employee_id: 2,
  //     leave_type_id: 1, // Annual Leave
  //     start_date: "2025-01-15",
  //     end_date: "2025-01-15",
  //     total_days: 1.0,
  //     reason: "Annual leave for personal matters.",
  //     status: "Approved",
  //     approved_by_id: APPROVER_ID,
  //     approval_date: now,
  //   },
  //
  //   // --- Leave 2: Employee 3 Planned Sick Leave (Matches null attendance on Jan 20) ---
  //   {
  //     employee_id: 3,
  //     leave_type_id: 2, // Sick Leave
  //     start_date: "2025-01-20",
  //     end_date: "2025-01-20",
  //     total_days: 1.0,
  //     reason: "Doctor appointment (attaching sick note).",
  //     status: "Approved",
  //     approved_by_id: APPROVER_ID,
  //     approval_date: now,
  //   },
  //
  //   // --- Leave 3: Employee 5 Multi-Day Annual Leave (Covers Jan 12 and the weekend before) ---
  //   // Note: Our attendance data only had Jan 12 marked as null, but multi-day requests are common.
  //   {
  //     employee_id: 5,
  //     leave_type_id: 1, // Annual Leave
  //     start_date: "2025-01-11", // Saturday
  //     end_date: "2025-01-13", // Monday
  //     total_days: 3.0,
  //     reason: "Extended weekend trip out of town.",
  //     status: "Approved",
  //     approved_by_id: APPROVER_ID,
  //     approval_date: now,
  //   },
  //
  //   // --- Leave 4: Employee 7 Long Sick Leave (Covers some of their scheduled absences) ---
  //   {
  //     employee_id: 7,
  //     leave_type_id: 2, // Sick Leave
  //     start_date: "2025-01-20",
  //     end_date: "2025-01-24", // Covers 5 days (two full absence days and surrounding days)
  //     total_days: 5.0,
  //     reason: "Extended flu and medical recovery.",
  //     status: "Approved",
  //     approved_by_id: APPROVER_ID,
  //     approval_date: now,
  //   },
  //
  //   // --- Leave 5: Pending Request (For testing approval workflows) ---
  //   {
  //     employee_id: 4,
  //     leave_type_id: 1, // Annual Leave
  //     start_date: "2025-01-25",
  //     end_date: "2025-01-25",
  //     total_days: 1.0,
  //     reason: "Requesting a day off next week.",
  //     status: "Pending",
  //     approved_by_id: null,
  //     approval_date: null,
  //   },
  //
  //   // --- Leave 6: Rejected Request (For testing non-approved leaves) ---
  //   {
  //     employee_id: 6,
  //     leave_type_id: 1, // Annual Leave
  //     start_date: "2025-01-09",
  //     end_date: "2025-01-09",
  //     total_days: 1.0,
  //     reason: "Urgent family matter (rejected due to staffing).",
  //     status: "Rejected",
  //     approved_by_id: APPROVER_ID,
  //     approval_date: now,
  //   },
  // ];
  //
  // // Insert the rows
  // await knex("leave_requests").insert(rows);
}
