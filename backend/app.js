
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import mockTestRoutes from "./routes/mockTestRoutes.js";
import aiRoutes from "./routes/AI-routes.js";
import questionRoutes from "./routes/questionRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";

import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// Allowed frontend origins.
// Local development works by default.
// Add your Vercel URL to CORS_ORIGINS in Render later.
const allowedOrigins = (
    process.env.CORS_ORIGINS || "http://localhost:5173"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests without an Origin header (e.g. Postman).
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error(`CORS blocked this origin: ${origin}`)
            );
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(helmet());
app.use(morgan("dev"));

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "PrepFlow API is running",
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/mocktests", mockTestRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/videos", videoRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Global error handler
app.use(errorHandler);

export default app;
