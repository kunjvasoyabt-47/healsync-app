import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import patientRoutes from "./routes/patientRoutes";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000; // Render uses 10000 by default
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

// USE THE NEW ROUTES
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("HealSync Backend is Running!");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);