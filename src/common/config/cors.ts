import { CorsOptions } from "cors";
import { config } from "dotenv";

config();

const allowedOriginsString: string =
  process.env.ALLOWED_ORIGINS || "http://localhost:3000";

const allowedOrigins: string[] = allowedOriginsString
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

export const corsOptions: CorsOptions = {
  // Use the parsed array
  origin: (origin, callback) => {
    // If no origin is provided (e.g., same-origin request, mobile app, tool like Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Timestamp",
    "X-Signature",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
};
