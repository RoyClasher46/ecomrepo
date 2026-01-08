const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("../middleware/auth");
const { getStats } = require("../controllers/adminController");

// Admin routes - require both authentication and admin privileges
router.get("/api/admin/stats", isLoggedIn, isAdmin, getStats);

module.exports = router;

