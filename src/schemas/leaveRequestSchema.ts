import { z } from "zod";

// Defines the minimum required date string format (ISO 8601: YYYY-MM-DD)
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD.");

export const addLeaveRequestSchema = z
  .object({
    leave_type_id: z.number({
      required_error: "ID Tipe Cuti wajib diisi.",
      invalid_type_error: "ID Tipe Cuti harus berupa angka.",
    }),
    start_date: dateString.min(10, "Tanggal mulai cuti wajib diisi."),
    end_date: dateString.min(10, "Tanggal selesai cuti wajib diisi."),
    reason: z
      .string({ required_error: "Alasan cuti wajib diisi." })
      .min(10, "Alasan minimal 10 karakter.")
      .max(500, "Alasan maksimal 500 karakter."),
  })
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: "Tanggal selesai cuti tidak boleh mendahului tanggal mulai cuti.",
    path: ["end_date"],
  });

// Define a schema for the Admin's decision
export const updateLeaveStatusSchema = z.object({
  status: z.enum(["Approved", "Rejected"], {
    required_error: "Status keputusan wajib diisi.",
    invalid_type_error: "Status harus 'Approved' atau 'Rejected'.",
  }),
});
