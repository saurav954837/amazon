import { db_config } from "../../config/database.js";

export const Order = {
    create: async (orderData) => {
        try {
            const stmt = `
                INSERT INTO orders 
                (user_id, total_amount, shipping_address, payment_method, payment_status, status) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const [result] = await db_config.query(stmt, [
                orderData.user_id,
                orderData.total_amount,
                orderData.shipping_address,
                orderData.payment_method,
                orderData.payment_status || 'pending',
                orderData.status || 'pending'
            ]);
            return result.insertId;
        } catch (error) {
            console.error(`Order create error: ${error.message}`);
            throw new Error(`Failed to create order: ${error.message}`);
        }
    },

    createOrderItems: async (orderId, items) => {
        try {
            if (!items || items.length === 0) {
                throw new Error('No items provided');
            }

            const stmt = `
                INSERT INTO order_items 
                (order_id, product_id, quantity, price_at_purchase) 
                VALUES ?
            `;
            
            const values = items.map(item => [
                orderId,
                item.product_id,
                item.quantity,
                item.price_at_purchase
            ]);
            
            const [result] = await db_config.query(stmt, [values]);
            return result.affectedRows;
        } catch (error) {
            console.error(`Create order items error: ${error.message}`);
            throw new Error(`Failed to create order items: ${error.message}`);
        }
    },

    readById: async (orderId) => {
        try {
            const stmt = `
                SELECT 
                    o.*,
                    u.username,
                    u.email,
                    u.phone
                FROM orders o
                JOIN users u ON o.user_id = u.user_id
                WHERE o.order_id = ?
            `;
            const [rows] = await db_config.query(stmt, [orderId]);
            return rows[0] || null;
        } catch (error) {
            console.error(`Order readById error: ${error.message}`);
            throw new Error(`Failed to fetch order: ${error.message}`);
        }
    },

    readByUserId: async (userId) => {
        try {
            const stmt = `
                SELECT 
                    o.*,
                    COUNT(oi.order_item_id) as item_count,
                    SUM(oi.quantity) as total_quantity
                FROM orders o
                LEFT JOIN order_items oi ON o.order_id = oi.order_id
                WHERE o.user_id = ?
                GROUP BY o.order_id
                ORDER BY o.created_at DESC
            `;
            const [rows] = await db_config.query(stmt, [userId]);
            return rows;
        } catch (error) {
            console.error(`Order readByUserId error: ${error.message}`);
            throw new Error(`Failed to fetch user orders: ${error.message}`);
        }
    },

    readAll: async (filters = {}, page = 1, limit = 20) => {
        try {
            let whereClause = '';
            const params = [];
            
            if (filters.status && filters.status !== 'all') {
                whereClause += ' WHERE o.status = ?';
                params.push(filters.status);
            }
            
            if (filters.user_id) {
                whereClause += whereClause ? ' AND o.user_id = ?' : ' WHERE o.user_id = ?';
                params.push(filters.user_id);
            }
            
            if (filters.search) {
                const searchTerm = `%${filters.search}%`;
                whereClause += whereClause ? 
                    ' AND (o.order_id LIKE ? OR u.username LIKE ? OR u.email LIKE ?)' : 
                    ' WHERE (o.order_id LIKE ? OR u.username LIKE ? OR u.email LIKE ?)';
                params.push(searchTerm, searchTerm, searchTerm);
            }

            const offset = (page - 1) * limit;
            
            const stmt = `
                SELECT 
                    o.*,
                    u.username,
                    u.email,
                    COUNT(oi.order_item_id) as item_count,
                    SUM(oi.quantity) as total_quantity,
                    SUM(oi.price_at_purchase * oi.quantity) as items_total
                FROM orders o
                JOIN users u ON o.user_id = u.user_id
                LEFT JOIN order_items oi ON o.order_id = oi.order_id
                ${whereClause}
                GROUP BY o.order_id
                ORDER BY o.created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            const countStmt = `
                SELECT COUNT(DISTINCT o.order_id) as total
                FROM orders o
                JOIN users u ON o.user_id = u.user_id
                ${whereClause}
            `;

            const [rows] = await db_config.query(stmt, [...params, limit, offset]);
            const [countRows] = await db_config.query(countStmt, params);
            
            return {
                orders: rows,
                total: countRows[0]?.total || 0,
                page,
                limit,
                totalPages: Math.ceil(countRows[0]?.total / limit) || 1
            };
        } catch (error) {
            console.error(`Order readAll error: ${error.message}`);
            throw new Error(`Failed to fetch orders: ${error.message}`);
        }
    },

    readOrderItems: async (orderId) => {
        try {
            const stmt = `
                SELECT 
                    oi.*,
                    p.product_name,
                    p.product_image,
                    p.product_category
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                WHERE oi.order_id = ?
                ORDER BY oi.created_at
            `;
            const [rows] = await db_config.query(stmt, [orderId]);
            return rows;
        } catch (error) {
            console.error(`Order readOrderItems error: ${error.message}`);
            throw new Error(`Failed to fetch order items: ${error.message}`);
        }
    },

    updateStatus: async (orderId, status) => {
        try {
            const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                throw new Error('Invalid order status');
            }

            const stmt = `
                UPDATE orders 
                SET status = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE order_id = ?
            `;
            const [result] = await db_config.query(stmt, [status, orderId]);
            return result.affectedRows;
        } catch (error) {
            console.error(`Order updateStatus error: ${error.message}`);
            throw new Error(`Failed to update order status: ${error.message}`);
        }
    },

    updatePaymentStatus: async (orderId, paymentStatus) => {
        try {
            const validStatuses = ['pending', 'paid', 'failed'];
            if (!validStatuses.includes(paymentStatus)) {
                throw new Error('Invalid payment status');
            }

            const stmt = `
                UPDATE orders 
                SET payment_status = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE order_id = ?
            `;
            const [result] = await db_config.query(stmt, [paymentStatus, orderId]);
            return result.affectedRows;
        } catch (error) {
            console.error(`Order updatePaymentStatus error: ${error.message}`);
            throw new Error(`Failed to update payment status: ${error.message}`);
        }
    },

    delete: async (orderId) => {
        try {
            const stmt = "DELETE FROM orders WHERE order_id = ?";
            const [result] = await db_config.query(stmt, [orderId]);
            return result.affectedRows;
        } catch (error) {
            console.error(`Order delete error: ${error.message}`);
            throw new Error(`Failed to delete order: ${error.message}`);
        }
    },

    getStats: async (period = 'month') => {
        try {
            let dateFilter = '';
            switch (period) {
                case 'day':
                    dateFilter = 'DATE(created_at) = CURDATE()';
                    break;
                case 'week':
                    dateFilter = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
                    break;
                case 'month':
                    dateFilter = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
                    break;
                case 'year':
                    dateFilter = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)';
                    break;
                default:
                    dateFilter = '1=1';
            }

            const stmt = `
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(total_amount) as total_revenue,
                    AVG(total_amount) as avg_order_value,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
                    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
                    SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_orders
                FROM orders
                WHERE ${dateFilter}
            `;
            
            const [rows] = await db_config.query(stmt);
            return rows[0] || {
                total_orders: 0,
                total_revenue: 0,
                avg_order_value: 0,
                cancelled_orders: 0,
                delivered_orders: 0,
                paid_orders: 0
            };
        } catch (error) {
            console.error(`Order getStats error: ${error.message}`);
            throw new Error(`Failed to get order stats: ${error.message}`);
        }
    },

    getMonthlyRevenue: async () => {
        try {
            const stmt = `
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    COUNT(*) as order_count,
                    SUM(total_amount) as revenue
                FROM orders
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                    AND status != 'cancelled'
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month
            `;
            const [rows] = await db_config.query(stmt);
            return rows;
        } catch (error) {
            console.error(`Order getMonthlyRevenue error: ${error.message}`);
            throw new Error(`Failed to get monthly revenue: ${error.message}`);
        }
    }
};