import { z } from "zod";

export const addMasterPositionsSchema = z.object({
  name: z
    .string({
      required_error: "Nama wajib diisi",
    })
    .min(3, "Nama posisi minimal 3 karakter")
    .max(100, "Nama posisi maksimal 100 karakter"),
  division_code: z.string().length(10, "Kode divisi harus tepat 10 karakter"),
  base_salary: z
    .number({
      invalid_type_error: "Gaji pokok harus berupa angka.",
      required_error: "Gaji pokok wajib diisi.",
    })
    .min(1000000, "Gaji pokok minimal 1.000.000")
    .max(100000000, "Gaji pokok maksimal 100.000.000"),
  description: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter.")
    .optional(),
});

export const updateMasterPositionsSchema = z
  .object({
    name: z
      .string()
      .min(3, "Nama posisi minimal 3 karakter")
      .max(100, "Nama posisi maksimal 100 karakter")
      .optional(),
    division_code: z
      .string()
      .length(10, "Kode divisi harus tepat 10 karakter")
      .optional(),
    base_salary: z
      .number({
        invalid_type_error: "Gaji pokok harus berupa angka.",
        required_error: "Gaji pokok wajib diisi.",
      })
      .min(1000000, "Gaji pokok minimal 1.000.000")
      .max(100000000, "Gaji pokok maksimal 100.000.000")
      .optional(),
    description: z
      .string()
      .max(500, "Deskripsi maksimal 500 karakter.")
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message:
      "Setidaknya satu field (name atau department_id) harus diisi untuk pembaruan.",
    path: ["body"],
  });
