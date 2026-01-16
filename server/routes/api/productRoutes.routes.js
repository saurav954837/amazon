import express from "express";
import { validate } from "../../app/middlewares/validationMiddleware.js";
import { authenticate } from "../../app/middlewares/authMiddleware.js";
import { adminMiddleware } from "../../app/middlewares/adminMiddleware.js";
import { 
    createProductValidator, 
    updateProductValidator,
    partialUpdateProductValidator,
    productIdValidator 
} from "../../app/validations/productValidation.js";
import { productController } from "../../app/controllers/productController.js";

export const productRouter = express.Router();

productRouter.get("/", productController.index);
productRouter.get("/:product_id", validate(productIdValidator), productController.show);
productRouter.post("/", authenticate, adminMiddleware, validate(createProductValidator), productController.store);
productRouter.put("/:product_id", authenticate, adminMiddleware, validate(productIdValidator), validate(updateProductValidator), productController.edit);
productRouter.patch("/:product_id", authenticate, adminMiddleware, validate(productIdValidator), validate(partialUpdateProductValidator), productController.edit)
productRouter.delete("/:product_id", authenticate, adminMiddleware, validate(productIdValidator), productController.destroy);
