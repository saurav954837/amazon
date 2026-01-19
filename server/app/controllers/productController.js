import { Product } from "../models/Product.js";

export const productController = {
    index: async (req, res) => {
        try {
            const products = await Product.read();
            res.status(200).json({
                message: "Products retrieved successfully.",
                success: true,
                data: products
            })
        } catch (error) {
            console.log(`Internal server error: ${error.message}`);
            res.status(500).json({
                message: "Internal server Error.",
                success: false
            });
        };
    },

    show: async (req, res) => {
        try {
            const product = await Product.readById(req.params.product_id);
            res.status(200).json({
                message: "Product retrieved successfully.",
                success: true,
                data: product
            });
        } catch (error) {
            console.log(`Product show error: ${error.message}`);
            res.status(500).json({
                message: "Internal server error.",
                success: false
            });
        };
    },

    store: async (req, res) => {
        try {
            const productData = {
                product_name: req.body.product_name,
                product_category: req.body.product_category,
                product_desc: req.body.product_desc,
                product_image: req.body.product_image,
                product_quantity: req.body.product_quantity,
                product_price: req.body.product_price,
                product_status: req.body.product_status,
            };

            const productID = await Product.create(productData);
            res.status(201).json({
                message: "Product created successfully.",
                success: true,
                data: { product_id: productID }
            });
        } catch (error) {
            console.log(`Product store error: ${error.message}`);
            res.status(500).json({
                message: "Failed to create product.",
                success: false
            });
        };
    },

    edit: async (req, res) => {
        try {
            const product_id = req.params.product_id;
            const updates = {};

            if (req.body.product_name !== undefined) {
                updates.product_name = req.body.product_name;
            }
            if (req.body.product_category !== undefined) {
                updates.product_category = req.body.product_category;
            }
            if (req.body.product_desc !== undefined) {
                updates.product_desc = req.body.product_desc;
            }
            if (req.body.product_image !== undefined) {
                updates.product_image = req.body.product_image;
            }
            if (req.body.product_quantity !== undefined) {
                updates.product_quantity = req.body.product_quantity;
            }
            if (req.body.product_price !== undefined) {
                updates.product_price = req.body.product_price;
            }
            if (req.body.product_status !== undefined) {
                updates.product_status = req.body.product_status;
            }

            const affectedRows = await Product.update(product_id, updates);

            if (affectedRows === 0) {
                return res.status(404).json({
                    message: "Product not found",
                    success: false
                });
            }

            res.status(200).json({
                message: "Product updated successfully",
                success: true
            });

        } catch (error) {
            console.error(`Product update failed: ${error.message}`);
            res.status(500).json({
                message: "Failed to update product.",
                success: false
            });
        }
    },

    destroy: async (req, res) => {
        try {
            const product_id = req.params.product_id;
            const product = await Product.readById(product_id);
            if (!product) {
                return res.status(404).json({
                    message: "Product not found",
                    success: false
                });
            };

            const affectedRows = await Product.delete(product_id);

            if (affectedRows === 0) {
                return res.status(404).json({
                    message: "Product not found",
                    success: false
                });
            };

            res.status(200).json({
                message: "Product deleted successfully",
                success: true
            });

        } catch (error) {
            console.error(`Product delete failed: ${error.message}`);
            res.status(500).json({
                message: "Failed to delete product",
                success: false
            });
        };
    }
};