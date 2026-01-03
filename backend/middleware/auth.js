const jwt = require("jsonwebtoken");

/**
 * Middleware to verify JWT token and authenticate user
 */
function isLoggedIn(req, res, next) {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: "You must be logged in" });
        }

        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data;
        return next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports = { isLoggedIn };

