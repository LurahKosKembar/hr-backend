import { z } from "zod";

// Helper to compare HH:mm:ss
const isTimeGreater = (t1: string, t2: string) => {
  const toSeconds = (t: string) => {
    const [h, m, s] = t.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  };
  return toSeconds(t1) > toSeconds(t2);
};

export const addAttendanceSessionsSchema = z
  .object({
    date: z
      .string({ required_error: "Tanggal sesi wajib diisi." })
      .refine(
        (val) => !isNaN(Date.parse(val)),
        "Format tanggal sesi tidak valid. Gunakan format YYYY-MM-DD."
      ),
    status: z.enum(["open", "closed"], {
      required_error: "Status sesi wajib diisi.",
      invalid_type_error: "Status sesi harus berupa 'open' atau 'closed'.",
    }),
    open_time: z
      .string({ required_error: "Waktu mulai wajib diisi." })
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
        "Format waktu mulai tidak valid. Gunakan format HH:mm:ss (misal: 08:00:00)."
      ),
    cutoff_time: z
      .string({ required_error: "Waktu batas keterlambatan wajib diisi." })
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
        "Format waktu mulai tidak valid. Gunakan format HH:mm:ss (misal: 09:00:00)."
      ),
    close_time: z
      .string({ required_error: "Waktu penutupan wajib diisi." })
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
        "Format waktu mulai tidak valid. Gunakan format HH:mm:ss (misal: 17:00:00)."
      ),
  })
  .refine((data) => isTimeGreater(data.cutoff_time, data.open_time), {
    message: "cutoff_time harus lebih besar dari open_time.",
    path: ["cutoff_time"],
  });

export const updateAttendanceSessionsSchema = z
  .object({
    date: z
      .string()
      .refine(
        (val) => !isNaN(Date.parse(val)),
        "Format tanggal sesi tidak valid. Gunakan format YYYY-MM-DD."
      )
      .optional(),
    status: z
      .enum(["open", "closed"], {
        invalid_type_error: "Status sesi harus berupa 'open' atau 'closed'.",
      })
      .optional(),
    open_time: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
        "Format waktu mulai tidak valid. Gunakan format HH:mm:ss (misal: 08:00:00)."
      )
      .optional(),
    cutoff_time: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
        "Format waktu mulai tidak valid. Gunakan format HH:mm:ss (misal: 09:00:00)."
      )
      .optional(),
    close_time: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
        "Format waktu mulai tidak valid. Gunakan format HH:mm:ss (misal: 17:00:00)."
      )
      .optional(),
  })
  .strict("Terdapat field yang tidak diperbolehkan.")
  .refine((data) => Object.keys(data).length > 0, {
    message: "Setidaknya satu field harus diisi untuk pembaruan.",
    path: ["body"],
  })
  .refine(
    (data) => {
      if (data.cutoff_time && data.open_time) {
        return isTimeGreater(data.cutoff_time, data.open_time);
      }
      return true; // skip validation if one is missing
    },
    {
      message: "cutoff_time harus lebih besar dari open_time.",
      path: ["cutoff_time"],
    }
  );
