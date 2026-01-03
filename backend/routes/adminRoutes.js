const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/auth");
const { getStats } = require("../controllers/adminController");

// Admin routes
router.get("/api/admin/stats", isLoggedIn, getStats);

module.exports = router;

