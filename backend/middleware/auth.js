const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

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

/**
 * Middleware to check if user is admin
 * Must be used after isLoggedIn middleware
 */
async function isAdmin(req, res, next) {
    try {
        // Check if user is admin from token
        if (req.user && req.user.isAdmin === true) {
            return next();
        }

        // Double check from database
        const user = await userModel.findById(req.user.userid).select("isAdmin");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isAdmin === true) {
            return next();
        }

        return res.status(403).json({ message: "Access denied. Admin privileges required." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = { isLoggedIn, isAdmin };

