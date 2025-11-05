import { z } from "zod";

export const addMasterPositionsSchema = z.object({
  name: z
    .string({
      required_error: "Nama wajib diisi",
    })
    .min(3, "Nama posisi minimal 3 karakter")
    .max(100, "Nama posisi maksimal 100 karakter"),
  position_code: z
    .string()
    .min(2, "Kode posisi minimal 2 karakter")
    .max(20, "Kode posisi maksimal 20 karakter"),
  department_id: z.number({
    invalid_type_error: "ID posisi harus berupa angka.",
    required_error: "ID posisi wajib diisi.",
  }),
  base_salary: z
    .number({
      invalid_type_error: "Gaji pokok harus berupa angka.",
      required_error: "Gaji pokok wajib diisi.",
    })
    .min(1000000, "Gaji pokok minimal 1.000.000")
    .max(100000000, "Gaji pokok maksimal 100.000.000"),
});

export const updateMasterPositionsSchema = z
  .object({
    name: z
      .string()
      .min(3, "Nama posisi minimal 3 karakter")
      .max(100, "Nama posisi maksimal 100 karakter")
      .optional(),
    position_code: z
      .string()
      .min(2, "Kode posisi minimal 2 karakter")
      .max(20, "Kode posisi maksimal 20 karakter")
      .optional(),
    department_id: z
      .number({
        invalid_type_error: "ID departemen harus berupa angka.",
      })
      .optional(),
    base_salary: z
      .number({
        invalid_type_error: "Gaji pokok harus berupa angka.",
      })
      .min(1000000, "Gaji pokok minimal 1.000.000")
      .max(100000000, "Gaji pokok maksimal 100.000.000")
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message:
      "Setidaknya satu field (name atau department_id) harus diisi untuk pembaruan.",
    path: ["body"],
  });
