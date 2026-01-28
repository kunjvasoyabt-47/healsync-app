import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import patientRoutes from "./routes/patientRoutes";

// 👉 IMPORT CENTRAL ROUTES
import { AUTH_ROUTES, DOCTOR_ROUTES, PATIENT_ROUTES } from "./config/routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000; // Render uses 10000 by default

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);

// Routes (USING ROUTE CONSTANTS)
app.use(AUTH_ROUTES.BASE, authRoutes);
app.use(DOCTOR_ROUTES.BASE, doctorRoutes);
app.use(PATIENT_ROUTES.BASE, patientRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("HealSync Backend is Running!");
});

// Start server (ONLY ONCE)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
