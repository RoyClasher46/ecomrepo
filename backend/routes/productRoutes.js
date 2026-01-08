const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
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

// Create new product
router.post("/api/uploadproduct", upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]), createProduct);

// Update product
router.put("/products/:id", upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]), updateProduct);

// Delete product
router.delete("/products/:id", deleteProduct);

// Toggle popular flag
router.put("/products/:id/popular", togglePopular);

// Add review to product
router.post("/api/products/:id/reviews", addReview);

// Get reviews for a product
router.get("/api/products/:id/reviews", getReviews);

// Get all categories
router.get("/api/categories", getCategories);

// Get homepage statistics
router.get("/api/home-stats", getHomeStats);

module.exports = router;

