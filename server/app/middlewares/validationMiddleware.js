import { validationResult } from "express-validator";

export const validate = (validations) => {
    return async (req, res, next) => {
        try {
            await Promise.all(validations.map(v => v.run(req)));
            
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('Validation errors:', errors.array());
                return res.status(400).json({ 
                    message: "Validation failed",
                    success: false,
                    errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
                });
            }
            
            console.log('Validation passed');
            next();
        } catch (error) {
            console.error('Validation middleware error:', error);
            res.status(500).json({
                message: "Internal server error",
                success: false
            });
        }
    };
};

export const sanitizeInput = (req, res, next) => {
    try {
        if (req.body && typeof req.body === 'object') {
            Object.keys(req.body).forEach(key => {
                if (typeof req.body[key] === 'string') {
                    if (req.body[key] === null || req.body[key] === undefined) {
                        req.body[key] = '';
                    } else {
                        req.body[key] = req.body[key].trim();
                    }
                }
            });
        }
        next();
    } catch (error) {
        console.error('Sanitization error:', error);
        next();
    }
};