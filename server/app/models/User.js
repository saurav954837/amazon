import { db_config } from "../../config/database.js";

export const User = {
    create: async (user) => {
        try {
            const stmt = `
                INSERT INTO users 
                (username, first_name, last_name, email, password_hash, role) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            const values = [
                user.username,
                user.first_name,
                user.last_name,
                user.email,
                user.password_hash,
                user.role || 'user'
            ];

            const [result] = await db_config.query(stmt, values);
            return result.insertId;
        } catch (error) {
            console.error(`User create error: ${error.message}`);
            throw new Error(`Failed to create user: ${error.message}`);
        }
    },

    read: async () => {
        try {
            const stmt = "SELECT user_id, username, first_name, last_name, email, role, created_at FROM users";
            const [rows] = await db_config.query(stmt);
            return rows;
        } catch (error) {
            console.error(`User read error: ${error.message}`);
            throw new Error(`Failed to fetch users: ${error.message}`);
        }
    },

    readById: async (user_id) => {
        try {
            const stmt = "SELECT user_id, username, first_name, last_name, email, password_hash, role, created_at, last_login FROM users WHERE user_id = ?";
            const [rows] = await db_config.query(stmt, [user_id]);
            return rows[0] || null;
        } catch (error) {
            console.error(`User readById error: ${error.message}`);
            throw new Error(`Failed to fetch user: ${error.message}`);
        }
    },

    readByEmail: async (email) => {
        try {
            const stmt = "SELECT * FROM users WHERE email = ?";
            const [rows] = await db_config.query(stmt, [email]);
            return rows[0] || null;
        } catch (error) {
            console.error(`User readByEmail error: ${error.message}`);
            throw new Error(`Failed to fetch user: ${error.message}`);
        }
    },

    readByUsername: async (username) => {
        try {
            const stmt = "SELECT * FROM users WHERE username = ?";
            const [rows] = await db_config.query(stmt, [username]);
            return rows[0] || null;
        } catch (error) {
            console.error(`User readByUsername error: ${error.message}`);
            throw new Error(`Failed to fetch user: ${error.message}`);
        }
    },

    update: async (user_id, updates) => {
        try {
            const fields = [];
            const values = [];

            if (updates.username !== undefined) {
                fields.push("username = ?");
                values.push(updates.username);
            }

            if (updates.first_name !== undefined) {
                fields.push("first_name = ?");
                values.push(updates.first_name);
            }

            if (updates.last_name !== undefined) {
                fields.push("last_name = ?");
                values.push(updates.last_name);
            }

            if (updates.email !== undefined) {
                fields.push("email = ?");
                values.push(updates.email);
            }

            if (updates.password_hash !== undefined) {
                fields.push("password_hash = ?");
                values.push(updates.password_hash);
            }

            if (updates.role !== undefined) {
                fields.push("role = ?");
                values.push(updates.role);
            }

            if (fields.length === 0) {
                throw new Error("No fields to update");
            }

            fields.push("updated_at = CURRENT_TIMESTAMP");
            values.push(user_id);

            const stmt = `UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`;
            const [result] = await db_config.query(stmt, values);

            return result.affectedRows;
        } catch (error) {
            console.error(`User update error: ${error.message}`);
            throw new Error(`Failed to update user: ${error.message}`);
        }
    },

    delete: async (user_id) => {
        try {
            const stmt = "DELETE FROM users WHERE user_id = ?";
            const [result] = await db_config.query(stmt, [user_id]);
            return result.affectedRows;
        } catch (error) {
            console.error(`User delete error: ${error.message}`);
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    },

    updateLastLogin: async (user_id) => {
        try {
            const stmt = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?";
            const [result] = await db_config.query(stmt, [user_id]);
            return result.affectedRows;
        } catch (error) {
            console.error(`Update last login error: ${error.message}`);
            throw new Error(`Failed to update last login: ${error.message}`);
        }
    }
};