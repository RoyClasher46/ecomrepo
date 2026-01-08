const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const { normalizeCategory } = require("../utils/categoryNormalizer");
const path = require("path");
const fs = require("fs");

/**
 * Get all products (legacy endpoint)
 */
// Helper function to get image URL (handles both Buffer and String paths)
const getImageUrl = (image) => {
    if (!image) return "";
    
    // If it's a Buffer (old format), convert to base64
    if (Buffer.isBuffer(image)) {
        return `data:image/jpeg;base64,${image.toString("base64")}`;
    }
    
    // If it's a string path (new format), return the path
    if (typeof image === 'string') {
        // If it already starts with /uploads, return as is
        if (image.startsWith('/uploads/')) {
            return image;
        }
        // If it's a relative path like "uploads/products/filename.jpg", convert to absolute URL path
        if (image.startsWith('uploads/')) {
            return `/${image}`;
        }
        // If it's just a filename, construct the full path
        if (!image.includes('/') && !image.includes('\\')) {
            return `/uploads/products/${image}`;
        }
        // Otherwise, try to extract filename and construct path
        return `/uploads/products/${path.basename(image)}`;
    }
    
    return "";
};

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
            image: getImageUrl(p.image),
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
            image: getImageUrl(p.image),
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
            ? product.images.map(img => {
                if (Buffer.isBuffer(img)) {
                    return `data:image/jpeg;base64,${img.toString("base64")}`;
                }
                if (typeof img === 'string') {
                    return img.startsWith('/uploads/') ? img : `/uploads/products/${path.basename(img)}`;
                }
                return "";
            }).filter(img => img)
            : [];

        res.json({
            _id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category || "Self",
            isPopular: product.isPopular || false,
            image: getImageUrl(product.image),
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

        // Get file paths instead of buffers - convert to relative paths
        const mainImage = req.files['image'] 
            ? path.relative(path.join(__dirname, '..'), req.files['image'][0].path).replace(/\\/g, '/')
            : null;
        const additionalImages = req.files['images']
            ? req.files['images'].map(file => path.relative(path.join(__dirname, '..'), file.path).replace(/\\/g, '/'))
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
            // Delete old image file if it exists
            if (product.image) {
                const oldImagePath = path.join(__dirname, '..', product.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            // Convert to relative path
            updateData.image = path.relative(path.join(__dirname, '..'), req.files['image'][0].path).replace(/\\/g, '/');
        }

        if (req.files && req.files['images'] && req.files['images'].length > 0) {
            const newImages = req.files['images'].map(file => 
                path.relative(path.join(__dirname, '..'), file.path).replace(/\\/g, '/')
            );
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
        const product = await productModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Delete image files from filesystem
        if (product.image) {
            const imagePath = path.join(__dirname, '..', product.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Delete additional images
        if (product.images && product.images.length > 0) {
            product.images.forEach(imgPath => {
                const fullPath = path.join(__dirname, '..', imgPath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            });
        }

        // Delete product from database
        await productModel.findByIdAndDelete(req.params.id);
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
 * Get all unique categories
 */
const getCategories = async (req, res) => {
    try {
        const products = await productModel.find({}, 'category');
        const categories = [...new Set(products.map(p => p.category || "Self").filter(Boolean))];
        // Sort categories alphabetically
        categories.sort();
        res.status(200).json({ categories });
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ message: "Server error", error: err.message });
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
    getCategories,
    getHomeStats
};

