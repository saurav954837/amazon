import { body, param, query } from "express-validator";

export const createOrderValidator = [
    body("shipping_address")
        .notEmpty().withMessage("Shipping address is required")
        .isLength({ min: 10, max: 500 }).withMessage("Shipping address must be between 10 and 500 characters")
        .trim(),

    body("payment_method")
        .notEmpty().withMessage("Payment method is required")
        .isString().withMessage("Payment method must be a string")
        .isLength({ max: 50 }).withMessage("Payment method too long")
        .trim(),

    body("cart_items")
        .notEmpty().withMessage("Cart items are required")
        .isArray().withMessage("Cart items must be an array")
        .custom((items) => {
            if (items.length === 0) {
                throw new Error("Cart items cannot be empty");
            }
            return true;
        }),

    body("cart_items.*.product_id")
        .isInt({ min: 1 }).withMessage("Product ID must be a positive integer"),

    body("cart_items.*.quantity")
        .isInt({ min: 1 }).withMessage("Quantity must be at least 1"),

    body("cart_items.*.price_at_purchase")
        .isFloat({ min: 0.01 }).withMessage("Price must be greater than 0")
];

export const updateOrderStatusValidator = [
    param("order_id")
        .notEmpty().withMessage("Order ID is required")
        .isInt({ min: 1 }).withMessage("Order ID must be a positive integer")
        .toInt(),

    body("status")
        .notEmpty().withMessage("Status is required")
        .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage("Invalid order status")
];

export const updatePaymentStatusValidator = [
    param("order_id")
        .notEmpty().withMessage("Order ID is required")
        .isInt({ min: 1 }).withMessage("Order ID must be a positive integer")
        .toInt(),

    body("payment_status")
        .notEmpty().withMessage("Payment status is required")
        .isIn(['pending', 'paid', 'failed'])
        .withMessage("Invalid payment status")
];

export const orderIdValidator = [
    param("order_id")
        .notEmpty().withMessage("Order ID is required")
        .isInt({ min: 1 }).withMessage("Order ID must be a positive integer")
        .toInt()
];

export const getOrdersValidator = [
    query("page")
        .optional()
        .isInt({ min: 1 }).withMessage("Page must be a positive integer")
        .toInt()
        .default(1),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100")
        .toInt()
        .default(20),

    query("status")
        .optional()
        .isIn(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage("Invalid status filter")
        .default('all'),

    query("search")
        .optional()
        .trim()
        .escape()
];

export const adminOrderStatsValidator = [
    query("period")
        .optional()
        .isIn(['day', 'week', 'month', 'year'])
        .withMessage("Invalid period")
        .default('month')
];