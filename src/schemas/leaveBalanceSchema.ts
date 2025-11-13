import z from "zod";

export const addLeaveBalanceSchema = z.object({
  employee_code: z.string().length(10, "Kode karyawan harus tepat 10 karakter"),
  type_code: z.string().length(10, "Kode tipe cuti harus tepat 10 karakter"),
  balance: z
    .number({
      required_error: "Jumlah hari/saldo wajib diisi.",
      invalid_type_error: "Jumlah saldo harus berupa angka.",
    })
    .positive("Jumlah saldo harus lebih besar dari nol."),
  year: z
    .number({
      required_error: "Tahun saldo wajib diisi.",
      invalid_type_error: "Tahun harus berupa angka.",
    })
    .min(2020, "Tahun harus valid.")
    .max(2100, "Tahun tidak valid.")
    .default(new Date().getFullYear()),
});

export const addBulkLeaveBalanceSchema = z.object({
  type_code: z.string().length(10, "Kode tipe cuti harus tepat 10 karakter"),
  balance: z
    .number({
      required_error: "Jumlah hari/saldo wajib diisi.",
      invalid_type_error: "Jumlah saldo harus berupa angka.",
    })
    .positive("Jumlah saldo harus lebih besar dari nol."),
  year: z
    .number({
      required_error: "Tahun saldo wajib diisi.",
      invalid_type_error: "Tahun harus berupa angka.",
    })
    .min(2020, "Tahun harus valid.")
    .max(2100, "Tahun tidak valid.")
    .default(new Date().getFullYear()),
});

export const updateLeaveBalanceSchema = z.object({
  type_code: z.string().length(10, "Kode tipe cuti harus tepat 10 karakter"),
  balance: z
    .number({
      required_error: "Jumlah saldo wajib diisi.",
      invalid_type_error: "Jumlah saldo harus berupa angka.",
    })
    .min(0, "Jumlah saldo tidak boleh negatif.")
    .optional(),
  year: z
    .number({
      required_error: "Tahun saldo wajib diisi.",
      invalid_type_error: "Tahun harus berupa angka.",
    })
    .min(2020, "Tahun harus valid.")
    .max(2100, "Tahun tidak valid.")
    .optional(),
});
