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
import { cartRouter } from "./routes/api/cartRoutes.routes.js";

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
app.use(express.json({
    limit: "10kb",
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf.toString());
        } catch (e) {
            throw new Error('Invalid JSON payload');
        }
    }
}));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const corsOptions = {
    origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",")
        : "http://localhost:5173",
    credentials: process.env.CORS_CREDENTIALS === "true",
    optionsSuccessStatus: 200,
    exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};
app.use(cors(corsOptions));

app.use(
    helmet({
        contentSecurityPolicy: process.env.NODE_ENV === "production" ? cspDirectives : false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    })
);

app.use(cookieParser());
app.use("/api/", limiter);

// Routes
app.use("/api/products/", productRouter);
app.use("/api/auth/", authRouter);
app.use("/api/cart/", cartRouter);

// 404 handler
app.use((req, res) => {
    console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        message: "Endpoint not found.",
        success: false,
        path: req.originalUrl,
    });
});

// Global Error handler
app.use((err, req, res, next) => {
    console.error(`Message: ${err}`);
    console.error(`Path: ${req.path}`);
    console.error(`Method: ${req.method}`);
    console.error(`IP: ${req.ip}`);

    res.status(500).json({
        message: "Internal Server Error.",
        success: false,
    });
});

app.listen(PORT, () => {
    console.log(`
📍 Server is running on: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || "development"}
🕒 Started: ${new Date().toLocaleString()}
🔗 Frontend: ${process.env.FRONTEND_URL}
`);
});

export default app;