import { z } from "zod";

export const addMasterDepartmentsSchema = z.object({
  name: z
    .string()
    .min(3, "Nama departemen minimal 3 karakter")
    .max(100, "Nama departemen maksimal 100 karakter"),
  department_code: z
    .string()
    .min(2, "Kode departemen minimal 2 karakter")
    .max(20, "Kode departemen maksimal 20 karakter"),
});

export const updateMasterDepartmentsSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nama departemen minimal 2 karakter")
      .max(100, "Nama departemen maksimal 100 karakter")
      .optional(),
    department_code: z
      .string()
      .min(2, "Kode departemen minimal 2 karakter")
      .max(20, "Kode departemen maksimal 20 karakter")
      .optional(),
  })
  .strict("Terdapat field yang tidak diperbolehkan.")
  .refine((data) => Object.keys(data).length > 0, {
    message: "Setidaknya satu field(nama) harus diisi untuk pembaruan.",
    path: ["body"],
  });
