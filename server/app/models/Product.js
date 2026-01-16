import { db_config } from "../../config/database.js";

export const Product = {
    create: async (product) => {
        try {
            const stmt = `
                INSERT INTO products 
                (product_name, product_category, product_desc, product_image, 
                 product_quantity, product_price, product_status) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                product.product_name, 
                product.product_category,
                product.product_desc || null,
                product.product_image || null,
                product.product_quantity,
                product.product_price,
                product.product_status || 'active'
            ];
            
            const [result] = await db_config.query(stmt, values);
            return result.insertId;
            
        } catch (error) {
            console.error(`Product create error: ${error.message}`);
            throw new Error(`Failed to create product: ${error.message}`);
        }
    },

    read: async () => {
        try {
            const stmt = "SELECT * FROM products ORDER BY created_at DESC";
            const [rows] = await db_config.query(stmt);
            return rows;
        } catch (error) {
            console.error(`Product read error: ${error.message}`);
            throw new Error(`Failed to fetch products: ${error.message}`);
        }
    },

    readById: async (product_id) => {
        try {
            const stmt = "SELECT * FROM products WHERE product_id = ?";
            const [rows] = await db_config.query(stmt, [product_id]);
            return rows[0] || null;
        } catch (error) {
            console.error(`Product readById error: ${error.message}`);
            throw new Error(`Failed to fetch product: ${error.message}`);
        }
    },

    update: async (product_id, updates) => {
        try {
            const fields = [];
            const values = [];
            
            if (updates.product_name !== undefined) {
                fields.push("product_name = ?");
                values.push(updates.product_name);
            }
            
            if (updates.product_category !== undefined) {
                fields.push("product_category = ?");
                values.push(updates.product_category);
            }
            
            if (updates.product_desc !== undefined) {
                fields.push("product_desc = ?");
                values.push(updates.product_desc || null);
            }
            
            if (updates.product_image !== undefined) {
                fields.push("product_image = ?");
                values.push(updates.product_image || null);
            }
            
            if (updates.product_quantity !== undefined) {
                fields.push("product_quantity = ?");
                values.push(updates.product_quantity);
            }
            
            if (updates.product_price !== undefined) {
                fields.push("product_price = ?");
                values.push(updates.product_price);
            }
            
            if (updates.product_status !== undefined) {
                fields.push("product_status = ?");
                values.push(updates.product_status || 'active');
            }
            
            if (fields.length === 0) {
                throw new Error("No fields to update");
            }
            
            fields.push("updated_at = CURRENT_TIMESTAMP");
            values.push(product_id);
            
            const stmt = `UPDATE products SET ${fields.join(", ")} WHERE product_id = ?`;
            const [result] = await db_config.query(stmt, values);
            
            return result.affectedRows;
            
        } catch (error) {
            console.error(`Product update error: ${error.message}`);
            throw new Error(`Failed to update product: ${error.message}`);
        }
    },

    delete: async (product_id) => {
        try {
            const stmt = "DELETE FROM products WHERE product_id = ?";
            const [result] = await db_config.query(stmt, [product_id]);
            return result.affectedRows;
            
        } catch (error) {
            console.error(`Product delete error: ${error.message}`);
            throw new Error(`Failed to delete product: ${error.message}`);
        }
    }
};