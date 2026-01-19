import { User } from "../models/User.js";

export const adminController = {
    getAllUsers: async (req, res) => {
        try {
            const users = await User.read();
            res.status(200).json({
                message: "Users retrieved successfully.",
                success: true,
                data: users
            });
        } catch (error) {
            console.log(`Get all users error: ${error.message}`);
            res.status(500).json({
                message: "Failed to retrieve users.",
                success: false
            });
        }
    },

    getUser: async (req, res) => {
        try {
            const user = await User.readById(req.params.user_id);
            if (!user) {
                return res.status(404).json({
                    message: "User not found.",
                    success: false
                });
            }
            
            res.status(200).json({
                message: "User retrieved successfully.",
                success: true,
                data: user
            });
        } catch (error) {
            console.log(`Get user error: ${error.message}`);
            res.status(500).json({
                message: "Failed to retrieve user.",
                success: false
            });
        }
    },

    updateUser: async (req, res) => {
        try {
            const user_id = req.params.user_id;
            const updates = {};

            if (req.body.first_name !== undefined) {
                updates.first_name = req.body.first_name;
            }
            if (req.body.last_name !== undefined) {
                updates.last_name = req.body.last_name;
            }
            if (req.body.email !== undefined) {
                updates.email = req.body.email;
            }
            if (req.body.username !== undefined) {
                updates.username = req.body.username;
            }
            if (req.body.role !== undefined) {
                updates.role = req.body.role;
            }

            const affectedRows = await User.update(user_id, updates);

            if (affectedRows === 0) {
                return res.status(404).json({
                    message: "User not found",
                    success: false
                });
            }

            res.status(200).json({
                message: "User updated successfully",
                success: true
            });

        } catch (error) {
            console.error(`User update failed: ${error.message}`);
            res.status(500).json({
                message: "Failed to update user.",
                success: false
            });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const user_id = req.params.user_id;
            const affectedRows = await User.delete(user_id);

            if (affectedRows === 0) {
                return res.status(404).json({
                    message: "User not found",
                    success: false
                });
            }

            res.status(200).json({
                message: "User deleted successfully",
                success: true
            });

        } catch (error) {
            console.error(`User delete failed: ${error.message}`);
            res.status(500).json({
                message: "Failed to delete user.",
                success: false
            });
        }
    }
};