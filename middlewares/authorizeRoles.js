export const authorizeRoles = (...roles) => (req, res, next) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
        }
        next();
    }
};