const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const { isLoggedIn, isAdmin } = require("../middleware/auth");
const {
    getAllProducts,
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    togglePopular,
    addReview,
    getReviews,
    getCategories,
    getHomeStats
} = require("../controllers/productController");

// Get all products (legacy endpoint)
router.get("/products", getAllProducts);

// Get all products with optional category filter
router.get("/api/products", getProducts);

// Get single product by ID
router.get("/api/products/:id", getProductById);

// Create new product - Admin only
router.post("/api/uploadproduct", isLoggedIn, isAdmin, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]), createProduct);

// Update product - Admin only
router.put("/products/:id", isLoggedIn, isAdmin, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]), updateProduct);

// Delete product - Admin only
router.delete("/products/:id", isLoggedIn, isAdmin, deleteProduct);

// Toggle popular flag - Admin only
router.put("/products/:id/popular", isLoggedIn, isAdmin, togglePopular);

// Add review to product
router.post("/api/products/:id/reviews", addReview);

// Get reviews for a product
router.get("/api/products/:id/reviews", getReviews);

// Get all categories
router.get("/api/categories", getCategories);

// Get homepage statistics
router.get("/api/home-stats", getHomeStats);

module.exports = router;

