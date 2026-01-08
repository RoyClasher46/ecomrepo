const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const { normalizeCategory } = require("../utils/categoryNormalizer");
const cloudinary = require("../config/cloudinary");

/**
 * Get all products (legacy endpoint)
 */
// Helper function to get image URL (handles Buffer, local paths, and Cloudinary URLs)
const getImageUrl = (image) => {
    if (!image) return "";
    
    // If it's a Buffer (old format), convert to base64
    if (Buffer.isBuffer(image)) {
        return `data:image/jpeg;base64,${image.toString("base64")}`;
    }
    
    // If it's a string
    if (typeof image === 'string') {
        // If it's already a Cloudinary URL (http/https), return as is
        if (image.startsWith('http://') || image.startsWith('https://')) {
            return image;
        }
        // If it's a data URL (base64), return as is
        if (image.startsWith('data:')) {
            return image;
        }
        // Legacy: If it starts with /uploads, return as is (for backward compatibility)
        if (image.startsWith('/uploads/')) {
            return image;
        }
        // Legacy: If it's a relative path, convert to absolute URL path
        if (image.startsWith('uploads/')) {
            return `/${image}`;
        }
    }
    
    return image || "";
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
                    // If it's already a Cloudinary URL (http/https), return as is
                    if (img.startsWith('http://') || img.startsWith('https://')) {
                        return img;
                    }
                    // Legacy: If it starts with /uploads, return as is
                    if (img.startsWith('/uploads/')) {
                        return img;
                    }
                    // Legacy: If it's a relative path, convert to absolute URL path
                    if (img.startsWith('uploads/')) {
                        return `/${img}`;
                    }
                    // Otherwise, assume it's base64 or return as is
                    return img;
                }
                return "";
            }).filter(img => img)
            : [];

        const productResponse = {
            _id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category || "Self",
            isPopular: product.isPopular || false,
            image: getImageUrl(product.image),
            images: images,
            sizes: product.sizes || [],
        };
        
        // Debug logging removed to prevent console spam
        // Uncomment only when debugging image issues
        // if (process.env.NODE_ENV === 'development') {
        //     console.log('Product image URLs:', {
        //         mainImage: productResponse.image,
        //         additionalImages: productResponse.images,
        //         originalImage: product.image
        //     });
        // }
        
        res.json(productResponse);
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

        // Get Cloudinary URLs from uploaded files
        // multer-storage-cloudinary returns the result in req.file/req.files
        // The Cloudinary response is stored in the file object
        let mainImage = null;
        if (req.files['image'] && req.files['image'][0]) {
            const file = req.files['image'][0];
            // multer-storage-cloudinary stores Cloudinary result in the file object
            // Check all possible properties where the URL might be stored
            mainImage = file.secure_url || file.url || file.path || (file.cloudinary && file.cloudinary.secure_url) || (file.cloudinary && file.cloudinary.url);
            
            if (!mainImage) {
                console.error('Could not extract Cloudinary URL from file');
            }
        }
        
        const additionalImages = req.files['images']
            ? req.files['images'].map(file => {
                const url = file.secure_url || file.url || file.path || (file.cloudinary && file.cloudinary.secure_url) || (file.cloudinary && file.cloudinary.url);
                if (!url) {
                    console.error('Could not extract Cloudinary URL from additional image');
                }
                return url;
            }).filter(url => url) // Remove any null/undefined URLs
            : [];

        // Validate that we have an image URL
        if (!mainImage) {
            return res.status(400).json({ message: "Failed to upload image. Please check Cloudinary configuration." });
        }

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
        
        res.status(200).json({ message: "product uploaded", product: { _id: newProduct._id, image: mainImage } });
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
            // Delete old image from Cloudinary if it's a Cloudinary URL
            if (product.image && (product.image.startsWith('http://') || product.image.startsWith('https://'))) {
                try {
                    // Extract public_id from Cloudinary URL
                    const urlParts = product.image.split('/');
                    const filename = urlParts[urlParts.length - 1];
                    const publicId = `ecommerce/products/${filename.split('.')[0]}`;
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error('Error deleting old image from Cloudinary:', err);
                }
            }
            // Store Cloudinary URL - check all possible properties
            const file = req.files['image'][0];
            updateData.image = file.secure_url || file.url || file.path || (file.cloudinary && file.cloudinary.secure_url) || (file.cloudinary && file.cloudinary.url);
        }

        if (req.files && req.files['images'] && req.files['images'].length > 0) {
            const newImages = req.files['images'].map(file => {
                return file.secure_url || file.url || file.path || (file.cloudinary && file.cloudinary.secure_url) || (file.cloudinary && file.cloudinary.url);
            }).filter(url => url); // Remove any null/undefined URLs
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
// Helper function to extract public_id from Cloudinary URL
const extractPublicId = (url) => {
    if (!url || typeof url !== 'string') return null;
    
    // If it's a Cloudinary URL
    if (url.includes('cloudinary.com')) {
        const parts = url.split('/');
        const uploadIndex = parts.findIndex(part => part === 'upload');
        if (uploadIndex !== -1 && parts[uploadIndex + 2]) {
            // Extract path after version (e.g., ecommerce/products/filename)
            const pathAfterVersion = parts.slice(uploadIndex + 2).join('/');
            // Remove file extension
            return pathAfterVersion.replace(/\.[^/.]+$/, '');
        }
    }
    return null;
};

const deleteProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Delete main image from Cloudinary if it's a Cloudinary URL
        if (product.image) {
            if (product.image.startsWith('http://') || product.image.startsWith('https://')) {
                try {
                    const publicId = extractPublicId(product.image);
                    if (publicId) {
                        await cloudinary.uploader.destroy(publicId);
                    }
                } catch (err) {
                    console.error('Error deleting main image from Cloudinary:', err);
                }
            }
        }

        // Delete additional images from Cloudinary
        if (product.images && product.images.length > 0) {
            for (const imgUrl of product.images) {
                if (imgUrl && (imgUrl.startsWith('http://') || imgUrl.startsWith('https://'))) {
                    try {
                        const publicId = extractPublicId(imgUrl);
                        if (publicId) {
                            await cloudinary.uploader.destroy(publicId);
                        }
                    } catch (err) {
                        console.error('Error deleting additional image from Cloudinary:', err);
                    }
                }
            }
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

