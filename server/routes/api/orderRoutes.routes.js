import express from "express";
import { validate } from "../../app/middlewares/validationMiddleware.js";
import { authenticate } from "../../app/middlewares/authMiddleware.js";
import { adminMiddleware } from "../../app/middlewares/adminMiddleware.js";
import {
    createOrderValidator,
    updateOrderStatusValidator,
    updatePaymentStatusValidator,
    orderIdValidator,
    getOrdersValidator,
    adminOrderStatsValidator
} from "../../app/validations/orderValidation.js";
import { orderController } from "../../app/controllers/orderController.js";

export const orderRouter = express.Router();

orderRouter.get("/user", authenticate, orderController.getUserOrders);
orderRouter.get("/:order_id", authenticate, validate(orderIdValidator), orderController.getOrderDetails);
orderRouter.get("/", authenticate, adminMiddleware, validate(getOrdersValidator), orderController.getAllOrders);
orderRouter.get("/stats", authenticate, adminMiddleware, validate(adminOrderStatsValidator), orderController.getOrderStats);
orderRouter.post("/", authenticate, validate(createOrderValidator), orderController.createOrder);
orderRouter.put("/:order_id/status", authenticate, adminMiddleware, validate(updateOrderStatusValidator), orderController.updateOrderStatus);
orderRouter.put("/:order_id/payment", authenticate, adminMiddleware, validate(updatePaymentStatusValidator), orderController.updatePaymentStatus);
orderRouter.put("/:order_id/cancel", authenticate, validate(orderIdValidator), orderController.cancelOrder);
orderRouter.delete("/:order_id", authenticate, adminMiddleware, validate(orderIdValidator), orderController.deleteOrder);