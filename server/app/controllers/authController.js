import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { generateTokens } from "../../utils/jwt.js";

export const authController = {
    register: async (req, res) => {
        try {
            const { username, first_name, last_name, email, password, role } = req.body;
            
            const existingUser = await User.readByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    message: "Email already exists",
                    success: false
                });
            }
            
            const existingUsername = await User.readByUsername(username);
            if (existingUsername) {
                return res.status(400).json({
                    message: "Username already exists",
                    success: false
                });
            }
            
            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);
            
            const userData = {
                username,
                first_name,
                last_name,
                email,
                password_hash,
                role: role || 'user'
            };
            
            const userId = await User.create(userData);
            
            const user = await User.readById(userId);
            const tokens = generateTokens(user);
            
            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            
            res.status(201).json({
                message: "User registered successfully",
                success: true,
                data: {
                    user: {
                        user_id: user.user_id,
                        username: user.username,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        role: user.role
                    },
                    accessToken: tokens.accessToken
                }
            });
        } catch (error) {
            console.error(`Register error: ${error.message}`);
            res.status(500).json({
                message: "Failed to register user",
                success: false
            });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            const user = await User.readByEmail(email);
            if (!user) {
                return res.status(401).json({
                    message: "Invalid credentials",
                    success: false
                });
            }
            
            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({
                    message: "Invalid credentials",
                    success: false
                });
            }
            
            await User.updateLastLogin(user.user_id);
            
            const tokens = generateTokens(user);
            
            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            
            res.json({
                message: "Login successful",
                success: true,
                data: {
                    user: {
                        user_id: user.user_id,
                        username: user.username,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        role: user.role
                    },
                    accessToken: tokens.accessToken
                }
            });
        } catch (error) {
            console.error(`Login error: ${error.message}`);
            res.status(500).json({
                message: "Failed to login",
                success: false
            });
        }
    },

    logout: async (req, res) => {
        try {
            res.clearCookie('refreshToken');
            res.json({
                message: "Logged out successfully",
                success: true
            });
        } catch (error) {
            console.error(`Logout error: ${error.message}`);
            res.status(500).json({
                message: "Failed to logout",
                success: false
            });
        }
    },

    refreshToken: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
            
            if (!refreshToken) {
                return res.status(400).json({
                    message: "Refresh token required",
                    success: false
                });
            }
            
            const { verifyRefreshToken, generateAccessToken } = await import("../utils/jwt.js");
            
            const decoded = verifyRefreshToken(refreshToken);
            
            if (decoded.token_type !== 'refresh') {
                return res.status(403).json({
                    message: "Invalid token type",
                    success: false
                });
            }
            
            const user = await User.readById(decoded.user_id);
            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                    success: false
                });
            }
            
            const newAccessToken = generateAccessToken(user);
            
            res.json({
                message: "Token refreshed successfully",
                success: true,
                data: {
                    accessToken: newAccessToken
                }
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    message: "Refresh token expired",
                    success: false
                });
            }
            
            res.status(403).json({
                message: "Invalid refresh token",
                success: false
            });
        }
    },

    profile: async (req, res) => {
        try {
            const user = await User.readById(req.user.user_id);
            
            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                    success: false
                });
            }
            
            res.json({
                message: "Profile retrieved successfully",
                success: true,
                data: {
                    user: {
                        user_id: user.user_id,
                        username: user.username,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        role: user.role,
                        created_at: user.created_at,
                        last_login: user.last_login
                    }
                }
            });
        } catch (error) {
            console.error(`Profile error: ${error.message}`);
            res.status(500).json({
                message: "Failed to get profile",
                success: false
            });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const updates = {};
            
            if (req.body.username !== undefined) {
                updates.username = req.body.username;
            }
            if (req.body.first_name !== undefined) {
                updates.first_name = req.body.first_name;
            }
            if (req.body.last_name !== undefined) {
                updates.last_name = req.body.last_name;
            }
            if (req.body.email !== undefined) {
                updates.email = req.body.email;
            }
            
            const affectedRows = await User.update(req.user.user_id, updates);
            
            if (affectedRows === 0) {
                return res.status(404).json({
                    message: "User not found",
                    success: false
                });
            }
            
            const updatedUser = await User.readById(req.user.user_id);
            
            res.json({
                message: "Profile updated successfully",
                success: true,
                data: {
                    user: {
                        user_id: updatedUser.user_id,
                        username: updatedUser.username,
                        first_name: updatedUser.first_name,
                        last_name: updatedUser.last_name,
                        email: updatedUser.email,
                        role: updatedUser.role
                    }
                }
            });
        } catch (error) {
            console.error(`Update profile error: ${error.message}`);
            res.status(500).json({
                message: "Failed to update profile",
                success: false
            });
        }
    },

    changePassword: async (req, res) => {
        try {
            const { current_password, new_password } = req.body;
            
            const user = await User.readById(req.user.user_id);
            
            const validPassword = await bcrypt.compare(current_password, user.password_hash);
            if (!validPassword) {
                return res.status(400).json({
                    message: "Current password is incorrect",
                    success: false
                });
            }
            
            const saltRounds = 10;
            const new_password_hash = await bcrypt.hash(new_password, saltRounds);
            
            const affectedRows = await User.update(req.user.user_id, { password_hash: new_password_hash });
            
            if (affectedRows === 0) {
                return res.status(404).json({
                    message: "User not found",
                    success: false
                });
            }
            
            res.json({
                message: "Password changed successfully",
                success: true
            });
        } catch (error) {
            console.error(`Change password error: ${error.message}`);
            res.status(500).json({
                message: "Failed to change password",
                success: false
            });
        }
    }
};