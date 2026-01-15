// App Main Imports
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

// App Main Configurations
dotenv.config();
const app = express();
const PORT = process.env.PORT;

// App Main Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV == "production" ? "combined" : "dev"));
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: process.env.CORS_CREDENTIALS
}));
app.use(helmet());
app.use(cookieParser());
// APP APIs Routes

// 404 Route Detection
app.use((req, res, next) => {
    res.status(404).json({
        message: "Endpoint is not defined.",
        success: false
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`Internal Server Error: ${err.message}`);
    res.status(500).json({
        message: "Internal Server Error",
        success: false
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`Database connection: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
    console.log(`Started at: ${new Date().toISOString()}`);
});