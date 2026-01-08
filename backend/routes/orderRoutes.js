const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("../middleware/auth");
const {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    assignDelivery,
    requestReturn,
    updateReturnStatus,
    verifyPayment,
    getReturnPolicy,
    updateReturnPolicy
} = require("../controllers/orderController");

// User order routes
router.post("/api/order", isLoggedIn, createOrder);
router.get("/api/myorders", isLoggedIn, getMyOrders);
router.get("/api/return-policy", getReturnPolicy);
router.post("/api/orders/:id/return", isLoggedIn, requestReturn);

// Admin order routes - require both authentication and admin privileges
router.get("/api/orders", isLoggedIn, isAdmin, getAllOrders);
router.put("/api/orders/:id/status", isLoggedIn, isAdmin, updateOrderStatus);
router.put("/api/orders/:id/assign-delivery", isLoggedIn, isAdmin, assignDelivery);
router.put("/api/orders/:id/return-status", isLoggedIn, isAdmin, updateReturnStatus);
router.put("/api/orders/:id/verify-payment", isLoggedIn, isAdmin, verifyPayment);
router.get("/api/admin/return-policy", isLoggedIn, isAdmin, getReturnPolicy);
router.put("/api/admin/return-policy", isLoggedIn, isAdmin, updateReturnPolicy);

module.exports = router;

