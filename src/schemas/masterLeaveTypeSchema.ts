import { z } from "zod";

export const addMasterLeaveTypesSchema = z.object({
  name: z
    .string({ required_error: "Nama tipe cuti wajib diisi" })
    .min(3, "Nama tipe cuti minimal 3 karakter")
    .max(100, "Nama tipe cuti maksimal 100 karakter"),

  deduction: z
    .number({
      invalid_type_error: "Pengurangan gaji harus berupa angka.",
      required_error: "Pengurangan wajib diisi.",
    })
    .min(0, "Pengurangan gaji minimal 0")
    .max(100000000, "Pengurangan gaji maksimal 100.000.000"),

  description: z
    .string()
    .max(255, "Deskripsi maksimal 255 karakter")
    .optional(),
});

export const updateMasterLeaveTypesSchema = z
  .object({
    name: z
      .string()
      .min(3, "Nama tipe cuti minimal 3 karakter")
      .max(100, "Nama tipe cuti maksimal 100 karakter")
      .optional(),

    deduction: z
      .number({
        invalid_type_error: "Pengurangan gaji harus berupa angka.",
      })
      .min(0, "Pengurangan gaji minimal 0")
      .max(100000000, "Pengurangan gaji maksimal 100.000.000")
      .optional(),

    description: z
      .string()
      .max(255, "Deskripsi maksimal 255 karakter")
      .optional(),
  })
  .strict("Terdapat field yang tidak diperbolehkan.")
  .refine((data) => Object.keys(data).length > 0, {
    message:
      "Setidaknya satu field (nama, pengurangan, atau deskripsi) harus diisi untuk pembaruan.",
    path: ["body"],
  });
