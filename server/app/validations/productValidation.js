import { body, param, query } from "express-validator";

export const createProductValidator = [
    body("product_name")
        .notEmpty().withMessage("Product name field is required.")
        .isLength({ min: 3, max: 255 }).withMessage("Product name must be between 3 and 255 characters.")
        .matches(/^[a-zA-Z0-9\s\-&.,()#+@!]+$/).withMessage("Product name contains invalid characters.")
        .customSanitizer(value => {
            return value.replace(/^\s+|\s+$/g, '');
        }),

    body("product_category")
        .notEmpty().withMessage("Product category field is required.")
        .isLength({ min: 2, max: 55 }).withMessage("Product category must be between 2 and 55 characters.")
        .matches(/^[a-zA-Z0-9\s\-&]+$/).withMessage("Category contains invalid characters.")
        .customSanitizer(value => {
            return value.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
        }),

    body("product_desc")
        .optional()
        .isLength({ min: 10, max: 2000 }).withMessage("Product description must be between 10 and 2000 characters.")
        .customSanitizer(value => {
            if (!value) return value;
            return value.replace(/^\s+|\s+$/g, '');
        })
        .escape(),

    body("product_image")
        .optional()
        .isURL().withMessage("Product image must be a valid URL.")
        .isLength({ max: 255 }).withMessage("Image URL too long.")
        .customSanitizer(value => {
            if (!value) return value;
            return value.trim();
        }),

    body("product_quantity")
        .notEmpty().withMessage("Product quantity is required.")
        .isInt({ min: 0, max: 10000 }).withMessage("Quantity must be between 0 and 10,000.")
        .toInt(),

    body("product_price")
        .notEmpty().withMessage("Product price is required.")
        .isFloat({ min: 0.01, max: 1000000 }).withMessage("Price must be between $0.01 and $1,000,000.")
        .toFloat(),

    body("product_status")
        .optional()
        .isIn(['active', 'inactive']).withMessage("Status must be 'active' or 'inactive'.")
];

export const sanitizeInput = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                if (key === 'product_name') {
                    req.body[key] = req.body[key].replace(/^\s+|\s+$/g, '');
                } 
                else if (key === 'product_category') {
                    req.body[key] = req.body[key].replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
                }
                else if (key === 'product_desc') {
                    req.body[key] = req.body[key].replace(/^\s+|\s+$/g, '');
                }
                else {
                    req.body[key] = req.body[key].trim();
                    if (req.body[key] === '' && !['product_name', 'product_category', 'product_quantity', 'product_price'].includes(key)) {
                        req.body[key] = null;
                    }
                };
            }
        });
    }
    
    next();
};

export const productIdValidator = [
    param("product_id")
        .isInt({ min: 1 }).withMessage("Product ID must be a positive integer.")
        .toInt()
];

export const productQueryValidator = [
    query("category")
        .optional()
        .trim()
        .isLength({ max: 55 }).withMessage("Category filter too long."),

    query("status")
        .optional()
        .isIn(['active', 'inactive']).withMessage("Status must be 'active' or 'inactive'.'"),

    query("min_price")
        .optional()
        .isFloat({ min: 0 }).withMessage("Minimum price must be 0 or greater.")
        .toFloat(),

    query("max_price")
        .optional()
        .isFloat({ min: 0 }).withMessage("Maximum price must be 0 or greater.")
        .toFloat()
        .custom((value, { req }) => {
            if (req.query.min_price && value < req.query.min_price) {
                throw new Error("Maximum price must be greater than minimum price.");
            }
            return true;
        }),

    query("search")
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage("Search term too long.")
        .escape(),

    query("page")
        .optional()
        .isInt({ min: 1 }).withMessage("Page must be at least 1.")
        .toInt()
        .default(1),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100.")
        .toInt()
        .default(20),

    query("sort_by")
        .optional()
        .isIn(['product_name', 'product_price', 'created_at', 'product_quantity']).withMessage("Invalid sort field."),

    query("sort_order")
        .optional()
        .isIn(['asc', 'desc']).withMessage("Sort order must be 'asc' or 'desc'.")
        .default('asc')
];

export const updateProductValidator = [
    param("product_id")
        .isInt({ min: 1 }).withMessage("Product ID must be a positive integer.")
        .toInt(),
    
    body("product_name")
        .optional()
        .isLength({ min: 3, max: 255 }).withMessage("Product name must be between 3 and 255 characters.")
        .matches(/^[a-zA-Z0-9\s\-&.,()#+@!]+$/).withMessage("Product name contains invalid characters.")
        .customSanitizer(value => {
            return value.replace(/^\s+|\s+$/g, '');
        }),

    body("product_category")
        .optional()
        .isLength({ min: 2, max: 55 }).withMessage("Product category must be between 2 and 55 characters.")
        .matches(/^[a-zA-Z0-9\s\-&]+$/).withMessage("Category contains invalid characters.")
        .customSanitizer(value => {
            return value.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
        }),

    body("product_desc")
        .optional()
        .isLength({ min: 10, max: 2000 }).withMessage("Product description must be between 10 and 2000 characters.")
        .customSanitizer(value => {
            if (!value) return value;
            return value.replace(/^\s+|\s+$/g, '');
        })
        .escape(),

    body("product_image")
        .optional()
        .isURL().withMessage("Product image must be a valid URL.")
        .isLength({ max: 255 }).withMessage("Image URL too long.")
        .customSanitizer(value => {
            if (!value) return value;
            return value.trim();
        }),

    body("product_quantity")
        .optional()
        .isInt({ min: 0, max: 10000 }).withMessage("Quantity must be between 0 and 10,000.")
        .toInt(),

    body("product_price")
        .optional()
        .isFloat({ min: 0.01, max: 1000000 }).withMessage("Price must be between $0.01 and $1,000,000.")
        .toFloat(),

    body("product_status")
        .optional()
        .isIn(['active', 'inactive']).withMessage("Status must be 'active' or 'inactive'."),

    body().custom((value, { req }) => {
        const updateFields = [
            'product_name', 'product_category', 'product_desc',
            'product_image', 'product_quantity', 'product_price', 'product_status'
        ];
        
        const hasAtLeastOne = updateFields.some(field => 
            req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== ''
        );
        
        if (!hasAtLeastOne) {
            throw new Error("At least one field must be provided for update");
        }
        
        return true;
    })
];

export const partialUpdateProductValidator = [
    param("product_id")
        .isInt({ min: 1 }).withMessage("Product ID must be a positive integer.")
        .toInt(),
    
    body("product_name")
        .optional()
        .isLength({ min: 3, max: 255 }).withMessage("Product name must be between 3 and 255 characters.")
        .customSanitizer(value => value?.replace(/^\s+|\s+$/g, '')),

    body("product_category")
        .optional()
        .isLength({ max: 55 }).withMessage("Product category too long.")
        .customSanitizer(value => value?.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ')),

    body("product_desc")
        .optional()
        .isLength({ max: 2000 }).withMessage("Product description too long.")
        .escape(),

    body("product_image")
        .optional()
        .isURL().withMessage("Product image must be a valid URL.")
        .isLength({ max: 255 }).withMessage("Image URL too long.")
        .customSanitizer(value => value?.trim()),

    body("product_quantity")
        .optional()
        .isInt({ min: 0, max: 10000 }).withMessage("Quantity must be between 0 and 10,000.")
        .toInt(),

    body("product_price")
        .optional()
        .isFloat({ min: 0.01 }).withMessage("Price must be at least $0.01.")
        .toFloat(),

    body("product_status")
        .optional()
        .isIn(['active', 'inactive']).withMessage("Status must be 'active' or 'inactive'."),
];