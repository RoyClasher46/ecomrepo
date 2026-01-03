const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/auth");
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

// Admin order routes
router.get("/api/orders", getAllOrders);
router.put("/api/orders/:id/status", updateOrderStatus);
router.put("/api/orders/:id/assign-delivery", assignDelivery);
router.put("/api/orders/:id/return-status", updateReturnStatus);
router.put("/api/orders/:id/verify-payment", verifyPayment);
router.get("/api/admin/return-policy", getReturnPolicy);
router.put("/api/admin/return-policy", updateReturnPolicy);

module.exports = router;

