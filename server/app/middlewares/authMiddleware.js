import { verifyAccessToken } from "../../utils/jwt.js";

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access Denied. No token provided.",
                success: false
            });
        };

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "No token provided.",
                success: false
            });
        };

        const decoded = verifyAccessToken(token);
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token Expired, Navigate to /refresh-token.",
                success: false,
                expired: true
            });
        };

        if (error.name === "JsonWebTokenError") {
            return res.status(403).json({
                message: "Invalid Token.",
                success: false
            });
        };

        console.error(`Authentication Error: ${error}`);
        res.status(500).json({
            message: "Authentication Error.",
            success: false
        });
    };
};