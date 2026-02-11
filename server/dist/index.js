"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // 🟢 Absolute top
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const node_cron_1 = __importDefault(require("node-cron"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const doctorRoutes_1 = __importDefault(require("./routes/doctorRoutes"));
const patientRoutes_1 = __importDefault(require("./routes/patientRoutes"));
const availabilityRoutes_1 = __importDefault(require("./routes/availabilityRoutes"));
const appointmentRoute_1 = __importDefault(require("./routes/appointmentRoute"));
const payment_controller_1 = require("./controllers/payment.controller");
const appointment_service_1 = require("./services/appointment.service");
const routes_1 = require("./config/routes");
const app = (0, express_1.default)();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 10000;
// 🟢 1. Stripe Webhook (MUST be before ANY app.use(express.json()))
app.post("/api/payments/webhook", express_1.default.raw({ type: "application/json" }), payment_controller_1.handleStripeWebhook);
// 2. Global Middleware
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const allowedOrigins = [
    'https://healsync-app.vercel.app',
    'http://localhost:3000'
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // 🟢 Required for HttpOnly cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'], // 🟢 Added Cookie header
}));
// Handle preflight requests
app.options('*', (0, cors_1.default)());
// 3. Routes
app.use(routes_1.AUTH_ROUTES.BASE, authRoutes_1.default);
app.use(routes_1.DOCTOR_ROUTES.BASE, doctorRoutes_1.default);
app.use(routes_1.PATIENT_ROUTES.BASE, patientRoutes_1.default);
app.use(routes_1.AVAILABILITY_ROUTES.BASE, availabilityRoutes_1.default);
app.use(routes_1.APPOINTMENT_ROUTES.BASE, appointmentRoute_1.default);
// Fix: Changed endpoint from /login to / to avoid confusion with frontend routes
app.get("/", (req, res) => {
    res.send("HealSync Backend is Running!");
});
// 4. Cron Job (The Janitor)
let isCleanupProcessing = false;
node_cron_1.default.schedule("*/15 * * * *", async () => {
    if (isCleanupProcessing)
        return;
    isCleanupProcessing = true;
    try {
        console.log("🧹 Starting background cleanup...");
        await (0, appointment_service_1.runAppointmentCleanup)();
    }
    catch (err) {
        console.error("❌ Cleanup failed:", err);
    }
    finally {
        isCleanupProcessing = false;
    }
});
app.listen(PORT, () => {
    // Use generic log for production
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map