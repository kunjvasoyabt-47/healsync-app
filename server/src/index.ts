import dotenv from "dotenv";
dotenv.config(); // 🟢 Ensure this is at the absolute top

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import authRoutes from "./routes/authRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import patientRoutes from "./routes/patientRoutes";
import availabilityRoutes from "./routes/availabilityRoutes";
import appointmentRoutes from "./routes/appointmentRoute";
import { handleStripeWebhook } from "./controllers/payment.controller";
import { runAppointmentCleanup } from "./services/appointment.service";
import { AUTH_ROUTES, AVAILABILITY_ROUTES, DOCTOR_ROUTES, PATIENT_ROUTES, APPOINTMENT_ROUTES } from "./config/routes";

const app = express();
const PORT = process.env.PORT || 10000;

// 🟢 1. Stripe Webhook (MUST be before ANY app.use)
// Placing it here guarantees express.json() never touches it.
app.post(
  "/api/payments/webhook", 
  express.raw({ type: "application/json" }), 
  handleStripeWebhook
);

// 2. Global Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 3. Routes
app.use(AUTH_ROUTES.BASE, authRoutes);
app.use(DOCTOR_ROUTES.BASE, doctorRoutes);
app.use(PATIENT_ROUTES.BASE, patientRoutes);
app.use(AVAILABILITY_ROUTES.BASE, availabilityRoutes);
app.use(APPOINTMENT_ROUTES.BASE, appointmentRoutes);

app.get("/", (req, res) => {
  res.send("HealSync Backend is Running!");
});

// 4. Cron Job (The Janitor)
let isCleanupProcessing = false;

cron.schedule("*/15 * * * *", async () => {
  if (isCleanupProcessing) return;
  
  isCleanupProcessing = true;
  try {
    console.log("🧹 Starting background cleanup...");
    await runAppointmentCleanup();
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
  } finally {
    isCleanupProcessing = false;
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});