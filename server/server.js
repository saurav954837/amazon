import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

// Routes
import { productRouter } from "./routes/api/productRoutes.routes.js";
import { authRouter } from "./routes/api/authRoutes.routes.js";

// Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        message: "Too many requests, please try again later.",
        success: false
    }
});

// App Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: process.env.CORS_CREDENTIALS
}));
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(cookieParser());
app.use("/api/", limiter);

// Routes
app.use("/api/products/", productRouter);
app.use("/api/auth/", authRouter);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: "Endpoint not found",
        success: false,
        path: req.originalUrl
    });
});

// Global Error handler
app.use((err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    console.error(`Stack: ${err.stack}`);
    
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === "production" 
        ? "Internal server error" 
        : err.message;
    
    res.status(statusCode).json({
        message: message,
        success: false,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`Started: ${new Date().toLocaleString()}`);
});

export default app;