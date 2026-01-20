import express from "express";
import { validate } from "../../app/middlewares/validationMiddleware.js";
import { authenticate } from "../../app/middlewares/authMiddleware.js";
import {
    addToCartValidator,
    updateCartItemValidator,
    cartIdValidator
} from "../../app/validations/cartValidation.js";
import { cartController } from "../../app/controllers/cartController.js";

export const cartRouter = express.Router();

cartRouter.post("/", authenticate, validate(addToCartValidator), cartController.addToCart);
cartRouter.get("/", authenticate, cartController.getCart);
cartRouter.get("/summary", authenticate, cartController.getCartSummary);
cartRouter.put("/:product_id", authenticate, validate(updateCartItemValidator), cartController.updateCartItem);
cartRouter.delete("/:product_id", authenticate, validate(cartIdValidator), cartController.removeFromCart);
cartRouter.delete("/", authenticate, cartController.clearCart);
cartRouter.post("/sync", authenticate, cartController.syncCart);