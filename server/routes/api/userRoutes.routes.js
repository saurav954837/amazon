import express from "express";
import { validate } from "../../app/middlewares/validationMiddleware.js";
import { authenticate } from "../../app/middlewares/authMiddleware.js";
import { adminMiddleware } from "../../app/middlewares/adminMiddleware.js";
import {
    adminUpdateUserValidator,
    adminUserIdValidator
} from "../../app/validations/adminValidation.js";
import { adminController } from "../../app/controllers/adminController.js";

export const userRouter = express.Router();

userRouter.get("/", authenticate, adminMiddleware, adminController.getAllUsers);
userRouter.get("/:user_id", authenticate, adminMiddleware, validate(adminUserIdValidator), adminController.getUser);
userRouter.put("/:user_id", authenticate, adminMiddleware, validate(adminUpdateUserValidator), adminController.updateUser);
userRouter.delete("/:user_id", authenticate, adminMiddleware, validate(adminUserIdValidator), adminController.deleteUser);