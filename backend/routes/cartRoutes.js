const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/auth");
const {
    addToCart,
    getCart,
    removeFromCart,
    clearCart
} = require("../controllers/cartController");

// All cart routes require authentication
router.post("/api/add-to-cart", isLoggedIn, addToCart);
router.get("/api/get-cart", isLoggedIn, getCart);
router.post("/api/remove-to-cart", isLoggedIn, removeFromCart);
router.post("/api/clear-cart", isLoggedIn, clearCart);

module.exports = router;

