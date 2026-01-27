import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import { Request, Response } from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

// USE THE NEW ROUTES
app.use("/api/auth", authRoutes);


app.get("/", (req: Request, res: Response) => {
    res.send("API is running");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});