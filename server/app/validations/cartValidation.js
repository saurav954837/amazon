import { body, param } from "express-validator";

export const addToCartValidator = [
    body("product_id")
        .notEmpty().withMessage("Product ID is required")
        .isInt({ min: 1 }).withMessage("Product ID must be a positive integer")
        .toInt(),

    body("quantity")
        .optional()
        .isInt({ min: 1 }).withMessage("Quantity must be at least 1")
        .toInt()
        .customSanitizer(value => value || 1)
];

export const updateCartItemValidator = [
    param("product_id")
        .notEmpty().withMessage("Product ID is required")
        .isInt({ min: 1 }).withMessage("Product ID must be a positive integer")
        .toInt(),

    body("quantity")
        .notEmpty().withMessage("Quantity is required")
        .isInt({ min: 0 }).withMessage("Quantity must be 0 or greater")
        .toInt()
        .custom(value => {
            if (value < 0) throw new Error("Quantity cannot be negative");
            return true;
        })
];

export const cartIdValidator = [
    param("product_id")
        .notEmpty().withMessage("Product ID is required")
        .isInt({ min: 1 }).withMessage("Product ID must be a positive integer")
        .toInt()
];