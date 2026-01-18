import express from "express";
import { validate } from "../../app/middlewares/validationMiddleware.js";
import { authenticate } from "../../app/middlewares/authMiddleware.js";
import {
    registerValidator,
    loginValidator,
    updateProfileValidator,
    changePasswordValidator,
    refreshTokenValidator
} from "../../app/validations/authValidaion.js";
import { authController } from "../../app/controllers/authController.js";

export const authRouter = express.Router();

authRouter.post("/register", validate(registerValidator), authController.register);
authRouter.post("/login", validate(loginValidator), authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/refresh-token", validate(refreshTokenValidator), authController.refreshToken);

authRouter.get("/verify", authenticate, authController.verify);

authRouter.get("/profile", authenticate, authController.profile);
authRouter.put("/profile", authenticate, validate(updateProfileValidator), authController.updateProfile);
authRouter.put("/change-password", authenticate, validate(changePasswordValidator), authController.changePassword);