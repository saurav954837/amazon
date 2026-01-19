import { Cart } from "../models/Cart.js";

export const cartController = {
    addToCart: async (req, res) => {
        try {
            const { product_id, quantity = 1 } = req.body;
            const user_id = req.user.user_id;

            const cartItem = {
                user_id,
                product_id,
                quantity: parseInt(quantity)
            };

            await Cart.create(cartItem);

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
        try {
            const { cart_id } = req.params;
            const { quantity } = req.body;

            const cartItem = await Cart.readByCartId(cart_id);

            if (!cartItem) {
                return res.status(404).json({
                    message: "Cart item not found",
                    success: false
                });
            }

            if (cartItem.user_id !== req.user.user_id) {
                return res.status(403).json({
                    message: "Unauthorized to update this cart item",
                    success: false
                });
            }

            const affectedRows = await Cart.updateQuantity(cart_id, parseInt(quantity));

            if (affectedRows === 0) {
                return res.status(404).json({
                    message: "Cart item not found",
                    success: false
                });
            }

            const cart = await Cart.readByUserId(req.user.user_id);
            const summary = await Cart.getCartSummary(req.user.user_id);

            res.json({
                message: "Cart item updated successfully",
                success: true,
                data: {
                    cart,
                    summary
                }
            });
        } catch (error) {
            console.error(`Update cart item error: ${error.message}`);
            res.status(500).json({
                message: "Failed to update cart item",
                success: false
            });
        }
    },

    removeFromCart: async (req, res) => {
        try {
            const { cart_id } = req.params;

            const cartItem = await Cart.readByCartId(cart_id);

            if (!cartItem) {
                return res.status(404).json({
                    message: "Cart item not found",
                    success: false
                });
            }

            if (cartItem.user_id !== req.user.user_id) {
                return res.status(403).json({
                    message: "Unauthorized to remove this cart item",
                    success: false
                });
            }

            const affectedRows = await Cart.delete(cart_id);

            if (affectedRows === 0) {
                return res.status(404).json({
                    message: "Cart item not found",
                    success: false
                });
            }

            const cart = await Cart.readByUserId(req.user.user_id);
            const summary = await Cart.getCartSummary(req.user.user_id);

            res.json({
                message: "Product removed from cart",
                success: true,
                data: {
                    cart,
                    summary
                }
            });
        } catch (error) {
            console.error(`Remove from cart error: ${error.message}`);
            res.status(500).json({
                message: "Failed to remove product from cart",
                success: false
            });
        }
    },

    clearCart: async (req, res) => {
        try {
            const user_id = req.user.user_id;

            const affectedRows = await Cart.deleteByUserId(user_id);

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
        try {
            const cartItems = req.body;
            const userId = req.user.user_id;
            await Cart.deleteByUserId(userId);
            if (!Array.isArray(cartItems)) {
                return res.status(400).json({
                    success: false,
                    message: 'Cart items must be an array'
                });
            }

            if (cartItems.length > 0) {
                const cartPromises = cartItems.map(item =>
                    Cart.create({
                        user_id: userId,
                        product_id: item.product_id,
                        quantity: item.quantity || 1
                    })
                );

                await Promise.all(cartPromises);
            }
            res.json({
                success: true,
                message: 'Cart synced successfully'
            });
        } catch (error) {
            console.error('Sync cart error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to sync cart'
            });
        }
    }
};