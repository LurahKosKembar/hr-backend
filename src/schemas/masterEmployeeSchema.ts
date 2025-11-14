import { z } from "zod";

export const addMasterEmployeesSchema = z.object({
  // required fields
  user_code: z.string().length(10, "Kode user harus tepat 10 karakter"),
  position_code: z.string().length(10, "Kode posisi harus tepat 10 karakter"),
  full_name: z
    .string({ required_error: "Nama panjang wajib diisi" })
    .min(3, "Nama panjang minimal 3 karakter")
    .max(100, "Nama panjang maksimal 100 karakter"),
  join_date: z
    .string({ required_error: "Tanggal masuk wajib diisi" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal masuk harus YYYY-MM-DD"),

  // optional fields
  ktp_number: z.string().nullable().optional(),
  birth_place: z.string().nullable().optional(),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal lahir harus YYYY-MM-DD")
    .nullable()
    .optional(),
  gender: z.enum(["laki-laki", "perempuan"]).nullable().optional(),
  address: z.string().nullable().optional(),
  contact_phone: z
    .string()
    .min(3, "Nomor telepon minimal 3 karakter")
    .max(20, "Nomor telepon maksimal 20 karakter")
    .nullable()
    .optional(),
  religion: z.string().nullable().optional(),
  maritial_status: z.string().nullable().optional(),
  resign_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal resign harus YYYY-MM-DD")
    .nullable()
    .optional(),
  employment_status: z
    .enum(["aktif", "inaktif"])
    .default("aktif")
    .nullable()
    .optional(),
  education: z
    .string()
    .min(2, "Pendidikan minimal 2 karakter")
    .max(50, "Pendidikan maksimal 50 karakter")
    .nullable()
    .optional(),
  blood_type: z
    .string()
    .min(1, "Golongan darah minimal 1 karakter")
    .max(5, "Golongan darah maksimal 5 karakter")
    .nullable()
    .optional(),
  profile_picture: z
    .string()
    .max(255, "Nama file/profile maksimal 255 karakter")
    .nullable()
    .optional(),
  bpjs_ketenagakerjaan: z
    .string()
    .min(3, "BPJS Ketenagakerjaan minimal 3 karakter")
    .max(50, "BPJS Ketenagakerjaan maksimal 50 karakter")
    .nullable()
    .optional(),
  bpjs_kesehatan: z
    .string()
    .min(3, "BPJS Kesehatan minimal 3 karakter")
    .max(50, "BPJS Kesehatan maksimal 50 karakter")
    .nullable()
    .optional(),
  npwp: z
    .string()
    .min(3, "NPWP minimal 3 karakter")
    .max(50, "NPWP maksimal 50 karakter")
    .nullable()
    .optional(),
  bank_account: z
    .string()
    .min(3, "Nomor rekening minimal 3 karakter")
    .max(50, "Nomor rekening maksimal 50 karakter")
    .nullable()
    .optional(),
});

export const updateMasterEmployeesSchema = z
  .object({
    user_code: z
      .string()
      .length(10, "Kode user harus tepat 10 karakter")
      .optional(),
    position_code: z
      .string()
      .length(10, "Kode posisi harus tepat 10 karakter")
      .optional(),
    full_name: z
      .string({ required_error: "Nama panjang wajib diisi" })
      .min(3, "Nama panjang minimal 3 karakter")
      .max(100, "Nama panjang maksimal 100 karakter")
      .optional(),
    join_date: z
      .string({ required_error: "Tanggal masuk wajib diisi" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal masuk harus YYYY-MM-DD")
      .optional(),

    // optional fields
    ktp_number: z.string().nullable().optional(),
    birth_place: z.string().nullable().optional(),
    birth_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal lahir harus YYYY-MM-DD")
      .nullable()
      .optional(),
    gender: z.enum(["laki-laki", "perempuan"]).nullable().optional(),
    address: z.string().nullable().optional(),
    contact_phone: z
      .string()
      .min(3, "Nomor telepon minimal 3 karakter")
      .max(20, "Nomor telepon maksimal 20 karakter")
      .nullable()
      .optional(),
    religion: z.string().nullable().optional(),
    maritial_status: z.string().nullable().optional(),
    resign_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal resign harus YYYY-MM-DD")
      .nullable()
      .optional(),
    employment_status: z.enum(["aktif", "inaktif"]).optional(),
    education: z
      .string()
      .min(2, "Pendidikan minimal 2 karakter")
      .max(50, "Pendidikan maksimal 50 karakter")
      .nullable()
      .optional(),
    blood_type: z
      .string()
      .min(1, "Golongan darah minimal 1 karakter")
      .max(5, "Golongan darah maksimal 5 karakter")
      .nullable()
      .optional(),
    profile_picture: z
      .string()
      .max(255, "Nama file/profile maksimal 255 karakter")
      .nullable()
      .optional(),
    bpjs_ketenagakerjaan: z
      .string()
      .min(3, "BPJS Ketenagakerjaan minimal 3 karakter")
      .max(50, "BPJS Ketenagakerjaan maksimal 50 karakter")
      .nullable()
      .optional(),
    bpjs_kesehatan: z
      .string()
      .min(3, "BPJS Kesehatan minimal 3 karakter")
      .max(50, "BPJS Kesehatan maksimal 50 karakter")
      .nullable()
      .optional(),
    npwp: z
      .string()
      .min(3, "NPWP minimal 3 karakter")
      .max(50, "NPWP maksimal 50 karakter")
      .nullable()
      .optional(),
    bank_account: z
      .string()
      .min(3, "Nomor rekening minimal 3 karakter")
      .max(50, "Nomor rekening maksimal 50 karakter")
      .nullable()
      .optional(),
  })
  .strict("Terdapat field yang tidak diperbolehkan.")
  .refine((data) => Object.keys(data).length > 0, {
    message: "Setidaknya satu field harus diisi untuk pembaruan.",
    path: ["body"],
  });
