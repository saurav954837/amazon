// App Imports
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

// App API Routes
import { productRouter } from "./routes/api/productRoutes.routes.js";
import { authRouter } from "./routes/api/authRoutes.routes.js";
import { userRouter } from "./routes/api/userRoutes.routes.js";
import { cartRouter } from "./routes/api/cartRoutes.routes.js";
import { orderRouter } from "./routes/api/orderRoutes.routes.js";

// App Configs
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : 0);

// Rate Limiters applied for all APIs
const createLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            message,
            success: false
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res, next, options) => {
            res.status(options.statusCode || 429).json(options.message);
        },
        skip: process.env.DISABLE_RATE_LIMIT === 'true' ? () => true : undefined
    });
};

const authLimiter = createLimiter(
    15 * 60 * 1000,
    50,
    "Too many authentication requests. Please try again in 15 minutes."
);

const productLimiter = createLimiter(
    15 * 60 * 1000,
    200,
    "Too many product requests. Please slow down."
);

const cartLimiter = createLimiter(
    15 * 60 * 1000,
    100,
    "Too many cart operations. Please try again later."
);

const orderLimiter = createLimiter(
    15 * 60 * 1000,
    50,
    "Too many order requests. Please wait before trying again."
);

const userAdminLimiter = createLimiter(
    15 * 60 * 1000,
    100,
    "Too many user management requests."
);

const globalAPILimiter = createLimiter(
    15 * 60 * 1000,
    100,
    "Too many requests, please try again later."
);

// App Middlewares
app.use(express.json({
    limit: "10kb",
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf.toString());
        } catch (e) {
            res.status(400).json({
                message: "Invalid JSON payload",
                success: false
            });
            throw new Error('Invalid JSON payload');
        };
    }
}));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const corsOptions = {
    origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",")
        : "http://localhost:5000",
    credentials: process.env.CORS_CREDENTIALS === "true",
    optionsSuccessStatus: 200,
    exposedHeaders: ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};
app.use(cors(corsOptions));

app.use(
    helmet({
        contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    })
);

// Web System APIs
app.use("/api/", globalAPILimiter);
app.use("/api/auth/", authLimiter);
app.use("/api/products/", productLimiter);
app.use("/api/cart/", cartLimiter);
app.use("/api/admin/users", userAdminLimiter);
app.use('/api/orders', orderLimiter);

// Web System Routes
app.use("/api/products/", productRouter);
app.use("/api/auth/", authRouter);
app.use("/api/cart/", cartRouter);
app.use("/api/admin/users", userRouter);
app.use('/api/orders', orderRouter);

// 404 handler
app.use((req, res) => {
    console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        message: "Endpoint not found.",
        success: false,
        path: req.originalUrl,
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    console.error(`Stack: ${err.stack}`);
    console.error(`Path: ${req.path}`);
    console.error(`Method: ${req.method}`);
    console.error(`IP: ${req.ip}`);

    if (err instanceof Error && err.name === 'RateLimitError') {
        return res.status(429).json({
            message: "Too many requests. Please try again later.",
            success: false,
            retryAfter: Math.ceil(err.retryAfter / 1000) || 900
        });
    };

    res.status(err.status || 500).json({
        message: "Internal Server Error.",
        success: false,
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    };
});

// Server Initialization
app.listen(PORT, () => {
    console.log(`
📍 Server is running on: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || "development"}
🕒 Started: ${new Date().toLocaleString()}
🔗 Frontend: ${process.env.FRONTEND_URL}
`);
});

export default app;