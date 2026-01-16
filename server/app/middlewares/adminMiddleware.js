export const adminMiddleware = (req, res, next) => {
    if(req.user.role !== "admin"){
        return res.status(403).json({
            message: "Access Denied. Admins only who are able to access.",
            success: false
        });
    };
    next();
};