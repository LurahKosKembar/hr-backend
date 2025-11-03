import cors, { CorsOptions } from "cors";
import express, { Application, Request, Response } from "express";
import { httpLogger } from "@utils/logger.js";

import { setResponseHeader } from "@middleware/set-headers.js";

import masterDepartmentRoutes from "@routes/masterDepartmentRoutes.js";
import masterPositionRoutes from "@routes/masterPositionRoutes.js";
import masterEmployeeRoutes from "@routes/masterEmployeeRoutes.js";
import userRoutes from "@routes/userRoutes.js";
import profileRoutes from "@routes/profileRoutes.js";
import employeeAttendanceRoutes from "@routes/employeeAttendanceRoutes.js";
import adminAttendanceRoutes from "@routes/adminAttendanceRoutes.js";
import authRoutes from "@routes/authRoutes.js";
import masterLeaveTypeRoutes from "@routes/masterLeaveTypeRoutes.js";

const app: Application = express();

// ====================================================================
// ||                 CORS CONFIGURATION SECTION                     ||
// ====================================================================
const allowedOrigins: string[] = ["http://localhost:3000"];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl) or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
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

// ====================================================================
// ||                     GLOBAL MIDDLEWARE                          ||
// ====================================================================
app.use(cors(corsOptions));
app.use(httpLogger); // HTTP Request Logger
app.use(express.json()); // Body Parser for JSON payloads
app.use(express.urlencoded({ extended: false })); // Body Parser for URL-encoded payloads

// ====================================================================
// ||                        ROOT ROUTE                              ||
// ====================================================================
app.get("/", setResponseHeader, (req: Request, res: Response) => {
  return res
    .status(200)
    .json(`Welcome to the server! ${new Date().toLocaleString()}`);
});

// ====================================================================
// ||                    ROUTE REGISTERING GOES HERE                 ||
// ====================================================================
app.use("/api/v1/master-departments", masterDepartmentRoutes);
app.use("/api/v1/master-positions", masterPositionRoutes);
app.use("/api/v1/master-employees", masterEmployeeRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/profiles", profileRoutes);
app.use("/api/v1/attendances", employeeAttendanceRoutes);
app.use("/api/v1/attendances", adminAttendanceRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/master-leave-types", masterLeaveTypeRoutes);

export default app;
