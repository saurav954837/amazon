import { body, param } from 'express-validator';

export const adminUpdateUserValidator = [
    param('user_id').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
    body('first_name')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2, max: 55 }).withMessage('First name must be between 2 and 55 characters'),
    body('last_name')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2, max: 55 }).withMessage('Last name must be between 2 and 55 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 55 }).withMessage('Username must be between 3 and 55 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),
    body('role')
        .trim()
        .notEmpty().withMessage('Role is required')
        .isIn(['admin', 'user']).withMessage('Role must be either admin or user')
];

export const adminUserIdValidator = [
    param('user_id').isInt({ min: 1 }).withMessage('User ID must be a positive integer')
];