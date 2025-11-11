import type { Knex } from "knex";

// interface AttendanceRow {
//   employee_id: number;
//   work_date: string;
//   check_in_time: string | null; // Allow string or null
//   check_out_time: string | null; // Allow string or null
// }

export async function seed(knex: Knex): Promise<void> {
  // // Deletes ALL existing entries in the 'attendances' table
  // await knex("attendances").del();
  //
  // const rows: AttendanceRow[] = [];
  //
  // // Define the date range (January 1st to January 31st, 2025)
  // const startDay = 1;
  // const endDay = 31;
  // const yearMonth = "2025-01-";
  //
  // // Helper function to create a date-time string
  // const createDateTime = (dateOnly: string, time: string) =>
  //   `${dateOnly} ${time}`;
  //
  // // --- Employee Data Generation Loop ---
  //
  // for (let day = startDay; day <= endDay; day++) {
  //   const dayString = day.toString().padStart(2, "0");
  //   const workDate = yearMonth + dayString;
  //   const dateOnly = workDate; // The date part used for datetime creation
  //
  //   // ====================================================================
  //   // NEW: Check if the day is a weekday (Monday-Friday)
  //   // Date.getDay() returns 0 for Sunday, 6 for Saturday.
  //   const dateObject = new Date(workDate);
  //   const dayOfWeek = dateObject.getDay();
  //
  //   if (dayOfWeek === 0 || dayOfWeek === 6) {
  //     // Skip the record generation for Saturday (6) and Sunday (0)
  //     continue;
  //   }
  //   // ====================================================================
  //
  //   // ====================================================================
  //   // --- Employee 2: Generally good, with scheduled incidents (Absence on the 15th) ---
  //   if (day !== 15) {
  //     // Skip record entirely if absent/on leave
  //     let checkIn2: string;
  //     let checkOut2: string | null;
  //
  //     if (day === 5) {
  //       // NOTE: Day 5 is a Sunday, which is skipped by the new logic. This branch will now never be hit.
  //       // For demonstration, let's change incident days to weekdays:
  //       // Let's use day 3 (Friday) for missing checkout
  //       checkIn2 = createDateTime(dateOnly, "08:00:00");
  //       checkOut2 = createDateTime(dateOnly, "17:00:00");
  //     } else if (day === 8) {
  //       checkIn2 = createDateTime(dateOnly, "09:15:00"); // Late arrival (Wednesday)
  //       checkOut2 = createDateTime(dateOnly, "17:00:00");
  //     } else if (day === 10) {
  //       checkIn2 = createDateTime(dateOnly, "08:00:00");
  //       checkOut2 = createDateTime(dateOnly, "16:30:00"); // Early departure (Friday)
  //     } else if (day === 25) {
  //       // NOTE: Day 25 is a Saturday, which is skipped.
  //       // Let's use day 24 (Friday) instead
  //       checkIn2 = createDateTime(dateOnly, "08:45:00");
  //       checkOut2 = createDateTime(dateOnly, "17:00:00");
  //     } else if (day === 3) {
  //       // New incident day for missing checkout (Friday)
  //       checkIn2 = createDateTime(dateOnly, "08:00:00");
  //       checkOut2 = null; // Missing checkout
  //     } else if (day === 24) {
  //       // New incident day for slightly late check-in (Friday)
  //       checkIn2 = createDateTime(dateOnly, "08:45:00");
  //       checkOut2 = createDateTime(dateOnly, "17:00:00");
  //     } else {
  //       checkIn2 = createDateTime(dateOnly, `08:00:${(day % 6) * 10}`);
  //       checkOut2 = createDateTime(dateOnly, `17:00:${(day % 7) * 5}`);
  //     }
  //
  //     rows.push({
  //       employee_id: 2,
  //       work_date: workDate,
  //       check_in_time: checkIn2,
  //       check_out_time: checkOut2,
  //     });
  //   }
  //   // ====================================================================
  //
  //   // --- Employee 3: Consistently late check-in and short hours (with one day off) ---
  //   if (day !== 20) {
  //     // Day 20 is a Monday, so it will be skipped (absence)
  //     rows.push({
  //       employee_id: 3,
  //       work_date: workDate,
  //       check_in_time: createDateTime(dateOnly, `08:30:${dayString}`),
  //       check_out_time: createDateTime(dateOnly, `16:45:${dayString}`),
  //     });
  //   }
  //   // ====================================================================
  //
  //   // --- Employee 4: Perfect check-in, but consistently missing check-out (No full absences) ---
  //   // Day 18 (Saturday) was the exception day, changing it to Day 17 (Friday).
  //   let checkOut4: string | null = null;
  //   if (day === 17) {
  //     checkOut4 = createDateTime(dateOnly, "17:05:00");
  //   }
  //   rows.push({
  //     employee_id: 4,
  //     work_date: workDate,
  //     check_in_time: createDateTime(dateOnly, "08:00:00"), // Mandatory check-in
  //     check_out_time: checkOut4,
  //   });
  //   // ====================================================================
  //
  //   // --- Employee 5: Overachiever (Early/Late, takes one planned day off) ---
  //   if (day !== 12) {
  //     // Day 12 is a Sunday, which is now skipped anyway. Let's make Day 9 (Thursday) the absence day.
  //     if (day !== 9) {
  //       rows.push({
  //         employee_id: 5,
  //         work_date: workDate,
  //         check_in_time: createDateTime(dateOnly, `07:45:${dayString}`),
  //         check_out_time: createDateTime(dateOnly, `17:15:${dayString}`),
  //       });
  //     }
  //   }
  //   // ====================================================================
  //
  //   // --- Employee 6: Highly inconsistent (alternating missing times, one full absence) ---
  //   if (day !== 28) {
  //     // Day 28 is a Tuesday, so it will be skipped (absence)
  //     let checkIn6: string = createDateTime(dateOnly, "08:05:00");
  //     let checkOut6: string | null = createDateTime(dateOnly, "17:00:00");
  //
  //     if (day % 3 === 2) {
  //       // Late check-in + long day (e.g., Jan 2, 9, 16, 23, 30 are Thursday)
  //       checkIn6 = createDateTime(dateOnly, `10:30:${dayString}`);
  //       checkOut6 = createDateTime(dateOnly, "18:00:00"); // Works late to compensate
  //     } else if (day % 3 === 1) {
  //       // Missing checkout (e.g., Jan 1, 6, 13, 27 are Wed/Mon)
  //       checkOut6 = null; // Missing checkout (check-in is present)
  //     }
  //     // Day % 3 === 0 will be normal (e.g., Jan 3, 17, 31 are Friday)
  //
  //     rows.push({
  //       employee_id: 6,
  //       work_date: workDate,
  //       check_in_time: checkIn6,
  //       check_out_time: checkOut6,
  //     });
  //   }
  //   // ====================================================================
  //
  //   // --- Employee 7: The "Very Late/Absent" Employee ---
  //   if (day % 4 !== 0) {
  //     // Day % 4 === 0 is the absence day (e.g., Jan 4 (Sat, skipped), Jan 8 (Wed), Jan 16 (Thu), Jan 24 (Fri), Jan 28 (Tue))
  //     let checkIn7: string;
  //     let checkOut7: string | null;
  //
  //     if (day % 4 === 1) {
  //       checkIn7 = createDateTime(dateOnly, `10:00:${dayString}`); // Very late arrival (e.g., Jan 1, 13, 27)
  //       checkOut7 = createDateTime(dateOnly, "17:00:00");
  //     } else {
  //       checkIn7 = createDateTime(dateOnly, `08:20:${dayString}`); // Standard/slightly late
  //       checkOut7 = createDateTime(dateOnly, "16:50:00");
  //     }
  //
  //     rows.push({
  //       employee_id: 7,
  //       work_date: workDate,
  //       check_in_time: checkIn7,
  //       check_out_time: checkOut7,
  //     });
  //   }
  //   // ====================================================================
  // }
  //
  // // Insert the rows
  // await knex("attendances").insert(rows);
}
