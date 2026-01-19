import { body, param } from "express-validator";

export const registerValidator = [
    body("first_name")
        .notEmpty().withMessage("First name is required")
        .isLength({ min: 2, max: 55 }).withMessage("First name must be 2-55 characters")
        .matches(/^[a-zA-Z\s]+$/).withMessage("First name can only contain letters and spaces")
        .customSanitizer(value => value ? value.trim() : ""),

    body("last_name")
        .notEmpty().withMessage("Last name is required")
        .isLength({ min: 2, max: 55 }).withMessage("Last name must be 2-55 characters")
        .matches(/^[a-zA-Z\s]+$/).withMessage("Last name can only contain letters and spaces")
        .customSanitizer(value => value ? value.trim() : ""),

    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail()
        .customSanitizer(value => value ? value.trim() : ""),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("Password must contain uppercase, lowercase, and number")
];

// Remove username from login validator too if it's not needed
export const loginValidator = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail()
        .customSanitizer(value => value ? value.trim() : ""),

    body("password")
        .notEmpty().withMessage("Password is required")
];

export const updateProfileValidator = [
    body("first_name")
        .optional()
        .isLength({ min: 2, max: 55 }).withMessage("First name must be 2-55 characters")
        .matches(/^[a-zA-Z\s]+$/).withMessage("First name can only contain letters and spaces")
        .customSanitizer(value => value ? value.trim() : ""),

    body("last_name")
        .optional()
        .isLength({ min: 2, max: 55 }).withMessage("Last name must be 2-55 characters")
        .matches(/^[a-zA-Z\s]+$/).withMessage("Last name can only contain letters and spaces")
        .customSanitizer(value => value ? value.trim() : ""),

    body("email")
        .optional()
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail()
        .customSanitizer(value => value ? value.trim() : "")
];

export const changePasswordValidator = [
    body("current_password")
        .notEmpty().withMessage("Current password is required"),

    body("new_password")
        .notEmpty().withMessage("New password is required")
        .isLength({ min: 8 }).withMessage("New password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("New password must contain uppercase, lowercase, and number")
        .custom((value, { req }) => {
            if (value === req.body.current_password) {
                throw new Error("New password must be different from current password");
            }
            return true;
        })
];

export const refreshTokenValidator = [
    body("refresh_token")
        .notEmpty().withMessage("Refresh token is required")
        .isString().withMessage("Refresh token must be a string")
];