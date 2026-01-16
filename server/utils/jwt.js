import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            user_id: user.user_id,
            username: user.username,
            email: user.email
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        }
    );
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            user_id: user.user_id,
            token_type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        }
    );
};

export const verifyAccessToken = (token) => {
    return jwt.verify(
        token, process.env.JWT_ACCESS_SECRET,
        {
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        }
    );
};

export const verifyRefreshToken = (token) => {
    return jwt.verify(
        token, process.env.JWT_REFRESH_SECRET,
        {
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        }
    );
};

export const generateTokens = (user) => {
    return {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user)
    };
};