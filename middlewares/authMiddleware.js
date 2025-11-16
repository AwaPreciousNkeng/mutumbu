import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    try {
        const token = req.cookies.access_token;
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }

        //Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            role: decoded.role
        };
        next();
    } catch (error) {
        console.error("Error in protect middleware:", error);
        res.status(401).json({ success: false, message: "Unauthorized: Invalid token or expired" });
    }
};