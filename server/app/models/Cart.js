import { db_config } from "../../config/database.js";

export const Cart = {
    create: async (cartItem) => {
        try {
            const stmt = `
                INSERT INTO cart (user_id, product_id, quantity) 
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE quantity = quantity + ?
            `;

            const [result] = await db_config.query(stmt, [
                cartItem.user_id,
                cartItem.product_id,
                cartItem.quantity,
                cartItem.quantity
            ]);
            
            return result.insertId || result.affectedRows;
        } catch (error) {
            console.error(`Cart create error: ${error.message}`);
            throw new Error(`Failed to add to cart: ${error.message}`);
        }
    },

    readByUserId: async (user_id) => {
        try {
            const stmt = `
                SELECT 
                    c.cart_id,
                    c.user_id,
                    c.product_id,
                    c.quantity,
                    c.created_at,
                    c.updated_at,
                    p.name as product_name,
                    p.price,
                    p.stock,
                    p.image_url,
                    (p.price * c.quantity) as subtotal
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                WHERE c.user_id = ?
                ORDER BY c.updated_at DESC
            `;
            
            const [rows] = await db_config.query(stmt, [user_id]);
            return rows;
        } catch (error) {
            console.error(`Cart readByUserId error: ${error.message}`);
            throw new Error(`Failed to fetch cart: ${error.message}`);
        }
    },

    readByCartId: async (cart_id) => {
        try {
            const stmt = `
                SELECT 
                    c.*,
                    p.name as product_name,
                    p.price,
                    p.stock
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                WHERE c.cart_id = ?
            `;
            
            const [rows] = await db_config.query(stmt, [cart_id]);
            return rows[0] || null;
        } catch (error) {
            console.error(`Cart readByCartId error: ${error.message}`);
            throw new Error(`Failed to fetch cart item: ${error.message}`);
        }
    },

    readByUserAndProduct: async (user_id, product_id) => {
        try {
            const stmt = "SELECT * FROM cart WHERE user_id = ? AND product_id = ?";
            const [rows] = await db_config.query(stmt, [user_id, product_id]);
            return rows[0] || null;
        } catch (error) {
            console.error(`Cart readByUserAndProduct error: ${error.message}`);
            throw new Error(`Failed to fetch cart item: ${error.message}`);
        }
    },

    updateQuantity: async (cart_id, quantity) => {
        try {
            if (quantity <= 0) {
                return await Cart.delete(cart_id);
            }

            const stmt = `
                UPDATE cart 
                SET quantity = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE cart_id = ?
            `;
            
            const [result] = await db_config.query(stmt, [quantity, cart_id]);
            return result.affectedRows;
        } catch (error) {
            console.error(`Cart updateQuantity error: ${error.message}`);
            throw new Error(`Failed to update cart: ${error.message}`);
        }
    },

    delete: async (cart_id) => {
        try {
            const stmt = "DELETE FROM cart WHERE cart_id = ?";
            const [result] = await db_config.query(stmt, [cart_id]);
            return result.affectedRows;
        } catch (error) {
            console.error(`Cart delete error: ${error.message}`);
            throw new Error(`Failed to remove from cart: ${error.message}`);
        }
    },

    deleteByUserId: async (user_id) => {
        try {
            const stmt = "DELETE FROM cart WHERE user_id = ?";
            const [result] = await db_config.query(stmt, [user_id]);
            return result.affectedRows;
        } catch (error) {
            console.error(`Cart deleteByUserId error: ${error.message}`);
            throw new Error(`Failed to clear cart: ${error.message}`);
        }
    },

    getCartSummary: async (user_id) => {
        try {
            const stmt = `
                SELECT 
                    COUNT(*) as total_items,
                    SUM(c.quantity) as total_quantity,
                    SUM(p.price * c.quantity) as total_price
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                WHERE c.user_id = ?
            `;
            const [rows] = await db_config.query(stmt, [user_id]);
            return rows[0] || { total_items: 0, total_quantity: 0, total_price: 0 };
        } catch (error) {
            console.error(`Cart getCartSummary error: ${error.message}`);
            throw new Error(`Failed to get cart summary: ${error.message}`);
        }
    }
};