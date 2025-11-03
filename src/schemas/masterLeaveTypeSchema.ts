import { z } from "zod";

export const addMasterLeaveTypesSchema = z.object({
  name: z
    .string({ required_error: "Nama tipe cuti wajib diisi" })
    .min(3, "Nama tipe cuti minimal 3 karakter")
    .max(100, "Nama tipe cuti maksimal 100 karakter"),

  description: z
    .string()
    .max(255, "Deskripsi maksimal 255 karakter")
    .optional()
    .nullable(),
});

export const updateMasterLeaveTypesSchema = z
  .object({
    name: z
      .string()
      .min(3, "Nama tipe cuti minimal 3 karakter")
      .max(100, "Nama tipe cuti maksimal 100 karakter")
      .optional(),

    description: z
      .string()
      .max(255, "Deskripsi maksimal 255 karakter")
      .optional()
      .nullable(),
  })
  .strict("Terdapat field yang tidak diperbolehkan.")
  .refine((data) => Object.keys(data).length > 0, {
    message:
      "Setidaknya satu field (nama atau deskripsi) harus diisi untuk pembaruan.",
    path: ["body"],
  });
