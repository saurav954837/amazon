import { Cart } from "../models/Cart.js";
import { db_config } from "../../config/database.js";

export const cartController = {
    addToCart: async (req, res) => {
        const connection = await db_config.getConnection();
        try {
            await connection.beginTransaction();
            
            const { product_id, quantity = 1 } = req.body;
            const user_id = req.user.user_id;

            const cartItem = {
                user_id,
                product_id,
                quantity: parseInt(quantity)
            };

            await Cart.create(cartItem, connection);
            await connection.commit();

            const cart = await Cart.readByUserId(user_id);
            const summary = await Cart.getCartSummary(user_id);

            res.status(201).json({
                message: "Product added to cart",
                success: true,
                data: {
                    cart,
                    summary
                }
            });
        } catch (error) {
            await connection.rollback();
            console.error(`Add to cart error: ${error.message}`);

            if (error.message.includes('foreign key constraint')) {
                return res.status(404).json({
                    message: "Product not found",
                    success: false
                });
            }

            res.status(500).json({
                message: "Failed to add product to cart",
                success: false
            });
        } finally {
            connection.release();
        }
    },

    getCart: async (req, res) => {
        try {
            const user_id = req.user.user_id;

            const cart = await Cart.readByUserId(user_id);
            const summary = await Cart.getCartSummary(user_id);

            res.json({
                message: "Cart retrieved successfully",
                success: true,
                data: {
                    cart,
                    summary
                }
            });
        } catch (error) {
            console.error(`Get cart error: ${error.message}`);
            res.status(500).json({
                message: "Failed to retrieve cart",
                success: false
            });
        }
    },

    updateCartItem: async (req, res) => {
        const connection = await db_config.getConnection();
        try {
            await connection.beginTransaction();
            
            const { product_id } = req.params;
            const { quantity } = req.body;
            const user_id = req.user.user_id;

            const cartItem = await Cart.readByUserAndProduct(user_id, product_id, connection);

            if (!cartItem) {
                await connection.rollback();
                return res.status(404).json({
                    message: "Cart item not found",
                    success: false
                });
            }

            const affectedRows = await Cart.updateQuantity(cartItem.cart_id, parseInt(quantity), connection);

            if (affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({
                    message: "Cart item not found",
                    success: false
                });
            }

            await connection.commit();

            const cart = await Cart.readByUserId(user_id);
            const summary = await Cart.getCartSummary(user_id);

            res.json({
                message: "Cart item updated successfully",
                success: true,
                data: {
                    cart,
                    summary
                }
            });
        } catch (error) {
            await connection.rollback();
            console.error(`Update cart item error: ${error.message}`);
            res.status(500).json({
                message: "Failed to update cart item",
                success: false
            });
        } finally {
            connection.release();
        }
    },

    removeFromCart: async (req, res) => {
        const connection = await db_config.getConnection();
        try {
            await connection.beginTransaction();
            
            const { product_id } = req.params;
            const user_id = req.user.user_id;

            const cartItem = await Cart.readByUserAndProduct(user_id, product_id, connection);

            if (!cartItem) {
                await connection.rollback();
                return res.status(404).json({
                    message: "Cart item not found",
                    success: false
                });
            }

            const affectedRows = await Cart.delete(cartItem.cart_id, connection);

            if (affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({
                    message: "Cart item not found",
                    success: false
                });
            }

            await connection.commit();

            const cart = await Cart.readByUserId(user_id);
            const summary = await Cart.getCartSummary(user_id);

            res.json({
                message: "Product removed from cart",
                success: true,
                data: {
                    cart,
                    summary
                }
            });
        } catch (error) {
            await connection.rollback();
            console.error(`Remove from cart error: ${error.message}`);
            res.status(500).json({
                message: "Failed to remove product from cart",
                success: false
            });
        } finally {
            connection.release();
        }
    },

    clearCart: async (req, res) => {
        try {
            const user_id = req.user.user_id;

            const affectedRows = await Cart.deleteAllByUserId(user_id);

            res.json({
                message: "Cart cleared successfully",
                success: true,
                data: {
                    items_removed: affectedRows,
                    cart: [],
                    summary: {
                        total_items: 0,
                        total_quantity: 0,
                        total_price: 0
                    }
                }
            });
        } catch (error) {
            console.error(`Clear cart error: ${error.message}`);
            res.status(500).json({
                message: "Failed to clear cart",
                success: false
            });
        }
    },

    getCartSummary: async (req, res) => {
        try {
            const user_id = req.user.user_id;

            const summary = await Cart.getCartSummary(user_id);

            res.json({
                message: "Cart summary retrieved",
                success: true,
                data: summary
            });
        } catch (error) {
            console.error(`Get cart summary error: ${error.message}`);
            res.status(500).json({
                message: "Failed to get cart summary",
                success: false
            });
        }
    },

    syncCart: async (req, res) => {
        const connection = await db_config.getConnection();
        try {
            await connection.beginTransaction();
            
            const cartItems = req.body;
            const userId = req.user.user_id;

            if (!Array.isArray(cartItems)) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Cart items must be an array'
                });
            }

            await Cart.deleteByUserId(userId, connection);

            if (cartItems.length > 0) {
                for (const item of cartItems) {
                    await Cart.create({
                        user_id: userId,
                        product_id: item.product_id,
                        quantity: item.quantity || 1
                    }, connection);
                }
            }

            await connection.commit();

            res.json({
                success: true,
                message: 'Cart synced successfully'
            });
        } catch (error) {
            await connection.rollback();
            console.error('Sync cart error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to sync cart'
            });
        } finally {
            connection.release();
        }
    }
};