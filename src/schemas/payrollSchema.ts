import { z } from "zod";

export const addPayrollSchema = z.object({
  payroll_period_id: z.number({
    required_error: "ID periode payroll wajib diisi.",
    invalid_type_error: "ID periode payroll harus berupa angka.",
  }),
  employee_id: z.number({
    required_error: "ID karyawan wajib diisi.",
    invalid_type_error: "ID karyawan harus berupa angka.",
  }),
  base_salary: z
    .number({
      required_error: "Gaji pokok wajib diisi.",
      invalid_type_error: "Gaji pokok harus berupa angka.",
    })
    .nonnegative("Gaji pokok tidak boleh bernilai negatif."),
  total_work_days: z
    .number({
      required_error: "Jumlah hari kerja wajib diisi.",
      invalid_type_error: "Jumlah hari kerja harus berupa angka.",
    })
    .min(0),
  total_leave_days: z
    .number({
      required_error: "Jumlah hari cuti wajib diisi.",
      invalid_type_error: "Jumlah hari cuti harus berupa angka.",
    })
    .min(0),
  total_deductions: z
    .number({
      required_error: "Total potongan wajib diisi.",
      invalid_type_error: "Total potongan harus berupa angka.",
    })
    .min(0),
  net_salary: z
    .number({
      required_error: "Gaji bersih wajib diisi.",
      invalid_type_error: "Gaji bersih harus berupa angka.",
    })
    .nonnegative("Gaji bersih tidak boleh negatif."),
  status: z.enum(["draft", "finalized", "paid"]).default("draft"),
});

export const updateSpecificPayrollSchema = z
  .object({
    base_salary: z
      .number({
        invalid_type_error: "Gaji pokok harus berupa angka.",
      })
      .nonnegative("Gaji pokok tidak boleh bernilai negatif.")
      .optional(),

    total_deductions: z
      .number({
        invalid_type_error: "Total potongan harus berupa angka.",
      })
      .min(0, "Total potongan tidak boleh kurang dari 0.")
      .optional(),

    status: z
      .enum(["draft", "finalized", "paid"], {
        invalid_type_error: "Status payroll tidak valid.",
      })
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message:
      "Setidaknya satu field (total_deductions, status, base_salary) harus diisi untuk pembaruan.",
    path: ["body"],
  });

export const generatePayrollSchema = z.object({
  payroll_period_id: z.number({
    required_error: "ID periode payroll wajib diisi.",
    invalid_type_error: "ID periode payroll harus berupa angka.",
  }),
});
