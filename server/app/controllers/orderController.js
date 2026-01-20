import { Order } from "../models/Order.js";
import { Cart } from "../models/Cart.js";

export const orderController = {
    createOrder: async (req, res) => {
        try {
            const { shipping_address, payment_method, cart_items } = req.body;
            const user_id = req.user.user_id;

            if (!cart_items || cart_items.length === 0) {
                return res.status(400).json({
                    message: "Cart is empty",
                    success: false
                });
            }

            const total_amount = cart_items.reduce((sum, item) => {
                return sum + (item.price_at_purchase * item.quantity);
            }, 0);

            const orderData = {
                user_id,
                total_amount,
                shipping_address,
                payment_method,
                payment_status: 'pending',
                status: 'pending'
            };

            const orderId = await Order.create(orderData);
            await Order.createOrderItems(orderId, cart_items);
            await Cart.deleteByUserId(user_id);

            const order = await Order.readById(orderId);
            const orderItems = await Order.readOrderItems(orderId);

            res.status(201).json({
                message: "Order created successfully",
                success: true,
                data: {
                    order,
                    items: orderItems
                }
            });
        } catch (error) {
            console.error(`Create order error: ${error.message}`);

            if (error.message.includes('foreign key constraint')) {
                return res.status(404).json({
                    message: "One or more products not found",
                    success: false
                });
            }

            res.status(500).json({
                message: "Failed to create order",
                success: false
            });
        }
    },

    getUserOrders: async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const orders = await Order.readByUserId(user_id);

            res.json({
                message: "Orders retrieved successfully",
                success: true,
                data: orders
            });
        } catch (error) {
            console.error(`Get user orders error: ${error.message}`);
            res.status(500).json({
                message: "Failed to retrieve orders",
                success: false
            });
        }
    },

    getOrderDetails: async (req, res) => {
        try {
            const { order_id } = req.params;
            const user_id = req.user.user_id;

            const order = await Order.readById(order_id);

            if (!order) {
                return res.status(404).json({
                    message: "Order not found",
                    success: false
                });
            }

            if (order.user_id !== user_id && req.user.role !== 'admin') {
                return res.status(403).json({
                    message: "Unauthorized to view this order",
                    success: false
                });
            }

            const orderItems = await Order.readOrderItems(order_id);

            res.json({
                message: "Order details retrieved",
                success: true,
                data: {
                    order,
                    items: orderItems
                }
            });
        } catch (error) {
            console.error(`Get order details error: ${error.message}`);
            res.status(500).json({
                message: "Failed to retrieve order details",
                success: false
            });
        }
    },

    getAllOrders: async (req, res) => {
        try {
            const { page = 1, limit = 20, status = 'all', search = '' } = req.query;
            const filters = { status: status !== 'all' ? status : null };

            if (search) {
                filters.search = search;
            }

            if (req.query.user_id && req.user.role === 'admin') {
                filters.user_id = req.query.user_id;
            }

            const result = await Order.readAll(filters, parseInt(page), parseInt(limit));

            res.json({
                message: "Orders retrieved successfully",
                success: true,
                data: result
            });
        } catch (error) {
            console.error(`Get all orders error: ${error.message}`);
            res.status(500).json({
                message: "Failed to retrieve orders",
                success: false
            });
        }
    },

    updateOrderStatus: async (req, res) => {
        try {
            const { order_id } = req.params;
            const { status } = req.body;

            const order = await Order.readById(order_id);

            if (!order) {
                return res.status(404).json({
                    message: "Order not found",
                    success: false
                });
            }

            const affectedRows = await Order.updateStatus(order_id, status);

            if (affectedRows === 0) {
                return res.status(404).json({
                    message: "Order not found",
                    success: false
                });
            }

            const updatedOrder = await Order.readById(order_id);

            res.json({
                message: "Order status updated successfully",
                success: true,
                data: updatedOrder
            });
        } catch (error) {
            console.error(`Update order status error: ${error.message}`);
            res.status(500).json({
                message: "Failed to update order status",
                success: false
            });
        }
    },

    updatePaymentStatus: async (req, res) => {
        try {
            const { order_id } = req.params;
            const { payment_status } = req.body;

            const order = await Order.readById(order_id);

            if (!order) {
                return res.status(404).json({
                    message: "Order not found",
                    success: false
                });
            }

            const affectedRows = await Order.updatePaymentStatus(order_id, payment_status);

            if (affectedRows === 0) {
                return res.status(404).json({
                    message: "Order not found",
                    success: false
                });
            }

            const updatedOrder = await Order.readById(order_id);

            res.json({
                message: "Payment status updated successfully",
                success: true,
                data: updatedOrder
            });
        } catch (error) {
            console.error(`Update payment status error: ${error.message}`);
            res.status(500).json({
                message: "Failed to update payment status",
                success: false
            });
        }
    },

    cancelOrder: async (req, res) => {
        try {
            const { order_id } = req.params;
            const user_id = req.user.user_id;

            const order = await Order.readById(order_id);

            if (!order) {
                return res.status(404).json({
                    message: "Order not found",
                    success: false
                });
            }

            if (order.user_id !== user_id && req.user.role !== 'admin') {
                return res.status(403).json({
                    message: "Unauthorized to cancel this order",
                    success: false
                });
            }

            if (order.status === 'cancelled') {
                return res.status(400).json({
                    message: "Order is already cancelled",
                    success: false
                });
            }

            if (order.status === 'delivered' || order.status === 'shipped') {
                return res.status(400).json({
                    message: `Cannot cancel order with status: ${order.status}`,
                    success: false
                });
            }

            const affectedRows = await Order.updateStatus(order_id, 'cancelled');

            if (affectedRows === 0) {
                return res.status(404).json({
                    message: "Order not found",
                    success: false
                });
            }

            const updatedOrder = await Order.readById(order_id);

            res.json({
                message: "Order cancelled successfully",
                success: true,
                data: updatedOrder
            });
        } catch (error) {
            console.error(`Cancel order error: ${error.message}`);
            res.status(500).json({
                message: "Failed to cancel order",
                success: false
            });
        }
    },

    deleteOrder: async (req, res) => {
        try {
            const { order_id } = req.params;

            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    message: "Only admins can delete orders",
                    success: false
                });
            }

            const order = await Order.readById(order_id);

            if (!order) {
                return res.status(404).json({
                    message: "Order not found",
                    success: false
                });
            }

            const affectedRows = await Order.delete(order_id);

            if (affectedRows === 0) {
                return res.status(404).json({
                    message: "Order not found",
                    success: false
                });
            }

            res.json({
                message: "Order deleted successfully",
                success: true
            });
        } catch (error) {
            console.error(`Delete order error: ${error.message}`);
            res.status(500).json({
                message: "Failed to delete order",
                success: false
            });
        }
    },

    getOrderStats: async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    message: "Only admins can view order stats",
                    success: false
                });
            }

            const { period = 'month' } = req.query;

            const stats = await Order.getStats(period);
            const monthlyRevenue = await Order.getMonthlyRevenue();

            res.json({
                message: "Order stats retrieved",
                success: true,
                data: {
                    stats,
                    monthlyRevenue
                }
            });
        } catch (error) {
            console.error(`Get order stats error: ${error.message}`);
            res.status(500).json({
                message: "Failed to retrieve order stats",
                success: false
            });
        }
    }
};