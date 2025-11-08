import { z } from "zod";

export const addMasterEmployeesSchema = z.object({
  first_name: z
    .string({ required_error: "Nama depan wajib diisi" })
    .min(3, "Nama depan minimal 3 karakter")
    .max(100, "Nama depan maksimal 100 karakter"),
  last_name: z
    .string({ required_error: "Nama belakang wajib diisi" })
    .min(3, "Nama belakang minimal 3 karakter")
    .max(100, "Nama belakang maksimal 100 karakter"),
  join_date: z
    .string({ required_error: "Tanggal masuk wajib diisi" })
    .date("Format tanggal masuk tidak valid."), // Pastikan ini .date() atau .datetime() jika Anda transformasi
  contact_phone: z
    .string()
    .min(3, "Nomor telepon minimal 3 karakter")
    .max(20, "Nomor telepon maksimal 20 karakter")
    .optional()
    .nullable(),
  address: z.string().optional().nullable(),
  position_id: z.number({
    invalid_type_error: "ID posisi harus berupa angka.",
    required_error: "ID posisi wajib diisi.",
  }),
});

export const updateMasterEmployeesSchema = z
  .object({
    first_name: z
      .string()
      .min(3, "Nama depan minimal 3 karakter")
      .max(100, "Nama depan maksimal 100 karakter")
      .optional(),
    last_name: z
      .string()
      .min(3, "Nama belakang minimal 3 karakter")
      .max(100, "Nama belakang maksimal 100 karakter")
      .optional(),
    position_id: z
      .number({ invalid_type_error: "ID posisi harus berupa angka." })
      .optional(),
    contact_phone: z
      .string()
      .min(3, "Nomor telepon minimal 3 karakter")
      .max(20, "Nomor telepon maksimal 20 karakter")
      .optional()
      .nullable(),
    address: z.string().optional().nullable(),
  })
  .strict("Terdapat field yang tidak diperbolehkan.") // Disallows extra fields
  .refine((data) => Object.keys(data).length > 0, {
    message: "Setidaknya satu field harus diisi untuk pembaruan.",
    path: ["body"],
  });
