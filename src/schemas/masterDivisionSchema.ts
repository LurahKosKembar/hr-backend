import { z } from "zod";

export const addMasterDivisionsSchema = z.object({
  name: z
    .string()
    .min(3, "Nama divisi minimal 3 karakter")
    .max(100, "Nama divisi maksimal 100 karakter"),
  department_code: z
    .string()
    .length(10, "Kode departemen harus tepat 10 karakter"),
  description: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter.")
    .optional(),
});

export const updateMasterDivisionsSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nama divisi minimal 2 karakter")
      .max(100, "Nama divisi maksimal 100 karakter")
      .optional(),
    department_code: z
      .string()
      .length(10, "Kode departemen harus tepat 10 karakter")
      .optional(),
    description: z
      .string()
      .max(500, "Deskripsi maksimal 500 karakter.")
      .optional(),
  })
  .strict("Terdapat field yang tidak diperbolehkan.")
  .refine((data) => Object.keys(data).length > 0, {
    message: "Setidaknya satu field harus diisi untuk pembaruan.",
    path: ["body"],
  });
