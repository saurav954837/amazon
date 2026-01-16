import { validationResult } from "express-validator";

export const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(v => v.run(req)));
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
            });
        }
        
        next();
    };
};

export const sanitizeInput = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                if (key === 'product_name' || key === 'product_desc') {
                    req.body[key] = req.body[key].replace(/^\s+|\s+$/g, '');
                } else {
                    req.body[key] = req.body[key].trim();
                }
            }
        });
    }
    next();
};