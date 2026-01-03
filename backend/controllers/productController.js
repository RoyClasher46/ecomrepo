const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const { normalizeCategory } = require("../utils/categoryNormalizer");

/**
 * Get all products (legacy endpoint)
 */
const getAllProducts = async (req, res) => {
    try {
        let products = await productModel.find();
        const formattedProducts = products.map(p => ({
            _id: p._id,
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category || "Self",
            isPopular: p.isPopular || false,
            createdAt: p.createdAt,
            image: p.image ? p.image.toString("base64") : "",
            sizes: p.sizes || [],
        }));
        res.status(200).json(formattedProducts);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
};

/**
 * Get all products with optional category filter
 */
const getProducts = async (req, res) => {
    try {
        const products = await productModel.find();
        const category = req.query.category;

        let filteredProducts = products;
        if (category && category !== "all") {
            filteredProducts = products.filter(p =>
                (p.category || "Self").toLowerCase() === category.toLowerCase()
            );
        }

        const updatedProducts = filteredProducts.map((p) => ({
            ...p._doc,
            image: p.image ? p.image.toString("base64") : "",
            category: p.category || "Self",
            isPopular: p.isPopular || false,
            createdAt: p.createdAt,
            sizes: p.sizes || [],
        }));

        res.json(updatedProducts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Get single product by ID
 */
const getProductById = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const images = product.images && product.images.length > 0
            ? product.images.map(img => `data:image/jpeg;base64,${img.toString("base64")}`)
            : [];

        res.json({
            _id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category || "Self",
            isPopular: product.isPopular || false,
            image: product.image ? `data:image/jpeg;base64,${product.image.toString("base64")}` : null,
            images: images,
            sizes: product.sizes || [],
        });
    } catch (err) {
        console.error("Fetch single product error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Create new product
 */
const createProduct = async (req, res) => {
    const { name, description, price, category, isPopular, sizes } = req.body;

    try {
        let parsedSizes = [];
        if (sizes) {
            try {
                parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
            } catch (e) {
                parsedSizes = [];
            }
        }

        const mainImage = req.files['image'] ? req.files['image'][0].buffer : null;
        const additionalImages = req.files['images']
            ? req.files['images'].map(file => file.buffer)
            : [];

        const newProduct = await productModel.create({
            name,
            description,
            price,
            category: normalizeCategory(category),
            isPopular: isPopular === "true" || isPopular === true,
            image: mainImage,
            images: additionalImages,
            sizes: parsedSizes,
        });
        res.status(200).json({ message: "product uploaded" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Update product
 */
const updateProduct = async (req, res) => {
    try {
        const { name, price, description, category, isPopular, sizes } = req.body;

        const product = await productModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const updateData = {
            name,
            price,
            description,
            category: normalizeCategory(category),
            isPopular: isPopular !== undefined ? isPopular : product.isPopular,
        };

        if (sizes !== undefined) {
            try {
                const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
                updateData.sizes = parsedSizes.filter(s => s.size && s.size.trim() !== "");
            } catch (e) {
                console.error("Error parsing sizes:", e);
            }
        }

        if (req.files && req.files['image'] && req.files['image'][0]) {
            updateData.image = req.files['image'][0].buffer;
        }

        if (req.files && req.files['images'] && req.files['images'].length > 0) {
            const newImages = req.files['images'].map(file => file.buffer);
            updateData.images = [...(product.images || []), ...newImages];
        }

        const updatedProduct = await productModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({ message: "Product updated successfully", product: updatedProduct });
    } catch (err) {
        console.error("Product Update Error:", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * Delete product
 */
const deleteProduct = async (req, res) => {
    try {
        const deleted = await productModel.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Toggle popular flag
 */
const togglePopular = async (req, res) => {
    try {
        const { isPopular } = req.body;
        const updated = await productModel.findByIdAndUpdate(
            req.params.id,
            { isPopular: !!isPopular },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Product not found" });
        res.json(updated);
    } catch (err) {
        console.error("Popular toggle error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Add review to product
 */
const addReview = async (req, res) => {
    try {
        const { user, rating, comment, reviewImages } = req.body;
        const product = await productModel.findById(req.params.id);

        if (!product) return res.status(404).json({ message: "Product not found" });

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const newReview = {
            user,
            rating: parseInt(rating),
            comment,
            reviewImages: reviewImages || []
        };
        product.reviews.push(newReview);

        await product.save();
        res.json({ message: "Review added successfully", reviews: product.reviews });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get reviews for a product
 */
const getReviews = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);

        if (!product) return res.status(404).json({ message: "Product not found" });

        res.json(product.reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get homepage statistics
 */
const getHomeStats = async (req, res) => {
    try {
        // Get total users (excluding admins)
        const totalUsers = await userModel.countDocuments({ isAdmin: { $ne: true } });
        
        // Get total products
        const totalProducts = await productModel.countDocuments();
        
        // Calculate average rating from all products
        const products = await productModel.find({ "reviews.rating": { $exists: true } });
        let totalRating = 0;
        let totalReviews = 0;
        
        products.forEach(product => {
            if (product.reviews && product.reviews.length > 0) {
                product.reviews.forEach(review => {
                    if (review.rating) {
                        totalRating += review.rating;
                        totalReviews++;
                    }
                });
            }
        });
        
        const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : "4.5";
        
        // Format numbers
        const formatNumber = (num) => {
            if (num >= 1000) {
                return (num / 1000).toFixed(1) + "K+";
            }
            return num.toString();
        };
        
        res.status(200).json({
            totalUsers: totalUsers,
            totalUsersFormatted: formatNumber(totalUsers),
            totalProducts: totalProducts,
            totalProductsFormatted: formatNumber(totalProducts),
            averageRating: parseFloat(averageRating),
            totalReviews: totalReviews
        });
    } catch (err) {
        console.error("Error fetching stats:", err);
        res.status(500).json({ 
            message: "Failed to fetch statistics",
            error: err.message 
        });
    }
};

module.exports = {
    getAllProducts,
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    togglePopular,
    addReview,
    getReviews,
    getHomeStats
};

