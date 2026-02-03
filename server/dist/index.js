"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const doctorRoutes_1 = __importDefault(require("./routes/doctorRoutes"));
const patientRoutes_1 = __importDefault(require("./routes/patientRoutes"));
const routes_1 = require("./config/routes");
dotenv_1.default.config();
console.log("DEBUG - EMAIL_USER VALUE:", `'${process.env.EMAIL_USER}'`);
const app = (0, express_1.default)();
const PORT = process.env.PORT || 10000; // Render uses 10000 by default
// Middlewares
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true
}));
// Routes (USING ROUTE CONSTANTS)
app.use(routes_1.AUTH_ROUTES.BASE, authRoutes_1.default);
app.use(routes_1.DOCTOR_ROUTES.BASE, doctorRoutes_1.default);
app.use(routes_1.PATIENT_ROUTES.BASE, patientRoutes_1.default);
// Health check
app.get("/", (req, res) => {
    res.send("HealSync Backend is Running!");
});
// Start server (ONLY ONCE)
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map