import { z } from "zod";

export const addUsersSchema = z.object({
  email: z
    .string({ required_error: "Email wajib diisi" })
    .email("Email tidak valid")
    .max(100, "Email maksimal 100 karakter"),
  password: z
    .string({ required_error: "Password wajib diisi" })
    .min(6, "Password minimal 6 karakter")
    .max(50, "Password maksimal 50 karakter"),
  role: z.enum(["admin", "employee"], {
    required_error: "Peran (Role) wajib diisi.",
  }),
});

export const updateUsersSchema = z
  .object({
    email: z
      .string()
      .email("Email tidak valid")
      .max(100, "Email maksimal 100 karakter")
      .optional(),
    password: z
      .string()
      .min(6, "Password minimal 6 karakter")
      .max(50, "Password maksimal 50 karakter")
      .optional(),
    role: z
      .enum(["admin", "employee"], {
        invalid_type_error:
          "Peran (Role) tidak valid. Hanya boleh 'admin' atau 'employee'.",
      })
      .optional(),
  })
  .strict("Terdapat field yang tidak diperbolehkan.")
  .refine((data) => Object.keys(data).length > 0, {
    message:
      "Setidaknya satu field (email, password, atau role) harus diisi untuk pembaruan.",
    path: ["body"],
  });
