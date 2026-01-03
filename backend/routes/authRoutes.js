const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/auth");
const {
    login,
    sendSignupOTP,
    verifySignupOTP,
    logout,
    checkAuth,
    sendForgotPasswordOTP,
    verifyForgotPasswordOTP,
    resetPassword,
    adminLogin,
    adminDashboard,
    adminCheckAuth,
    testEmail,
    checkEmailConfig,
    getProfile,
    updateProfile
} = require("../controllers/authController");

// User authentication routes
router.post("/api/login", login);
router.post("/api/signup/send-otp", sendSignupOTP);
router.post("/api/signup/verify-otp", verifySignupOTP);
router.post("/api/forgot-password/send-otp", sendForgotPasswordOTP);
router.post("/api/forgot-password/verify-otp", verifyForgotPasswordOTP);
router.post("/api/forgot-password/reset", resetPassword);
router.get("/api/logout", isLoggedIn, logout);
router.get("/api/checkauth", isLoggedIn, checkAuth);

// Admin authentication routes
router.post("/api/adminlogin", adminLogin);
router.get("/api/admin/dashboard", isLoggedIn, adminDashboard);
router.get("/api/admin/checkauth", isLoggedIn, adminCheckAuth);

// Test email configuration (for debugging)
router.post("/api/test-email", testEmail);
router.get("/api/check-email-config", checkEmailConfig);

// User profile routes
router.get("/api/profile", isLoggedIn, getProfile);
router.put("/api/profile", isLoggedIn, updateProfile);

module.exports = router;

