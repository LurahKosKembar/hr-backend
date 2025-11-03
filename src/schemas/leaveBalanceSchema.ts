import z from "zod";

export const addLeaveBalanceSchema = z.object({
  leave_type_id: z.number({
    required_error: "ID Tipe Cuti wajib diisi.",
    invalid_type_error: "ID Tipe Cuti harus berupa angka.",
  }),
  amount: z
    .number({
      required_error: "Jumlah hari/saldo wajib diisi.",
      invalid_type_error: "Jumlah saldo harus berupa angka.",
    })
    .positive("Jumlah saldo harus lebih besar dari nol."), // Must be a positive amount
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
  leave_type_id: z.number({
    required_error: "ID Tipe Cuti wajib diisi.",
    invalid_type_error: "ID Tipe Cuti harus berupa angka.",
  }),

  amount: z
    .number({
      required_error: "Jumlah saldo wajib diisi.",
      invalid_type_error: "Jumlah saldo harus berupa angka.",
    })
    .min(0, "Jumlah saldo tidak boleh negatif."),

  year: z
    .number({
      required_error: "Tahun saldo wajib diisi.",
      invalid_type_error: "Tahun harus berupa angka.",
    })
    .min(2020, "Tahun harus valid.")
    .max(2100, "Tahun tidak valid.")
    .default(new Date().getFullYear()),
});
