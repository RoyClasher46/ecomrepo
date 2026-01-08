const userModel = require("../models/user-model");
const path = require("path");

/**
 * Add item to cart
 */
const addToCart = async (req, res) => {
    const userId = req.user.userid;
    const { productId, size } = req.body;

    try {
        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const existingItem = user.cart.find(
            item => item.product.toString() === productId && item.size === (size || "")
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cart.push({ product: productId, quantity: 1, size: size || "" });
        }

        await user.save();
        res.status(200).json({ message: "Item added to cart" });
    } catch (err) {
        console.error("Error adding to cart:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Get user's cart
 */
const getCart = async (req, res) => {
    try {
        const user = await userModel
            .findById(req.user.userid)
            .populate("cart.product");

        if (!user) return res.status(404).json({ message: "User not found" });

        // Helper to get image URL (handles both Buffer and String)
        const getImageUrl = (image) => {
            if (!image) return "";
            if (Buffer.isBuffer(image)) {
                return `data:image/jpeg;base64,${image.toString("base64")}`;
            }
            if (typeof image === 'string') {
                if (image.startsWith('http://') || image.startsWith('https://')) {
                    return image; // Cloudinary URL
                }
                if (image.startsWith('data:')) {
                    return image; // Data URL
                }
                return image.startsWith('/uploads/') ? image : `/uploads/products/${path.basename(image)}`;
            }
            return "";
        };

        // Filter out items where product is null (product was deleted)
        const validCartItems = user.cart.filter(item => item.product !== null && item.product !== undefined);
        
        // If there are invalid items, clean up the cart
        if (validCartItems.length !== user.cart.length) {
            user.cart = validCartItems.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                size: item.size || ""
            }));
            await user.save();
        }

        const cartItems = validCartItems.map(item => ({
            _id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            image: getImageUrl(item.product.image),
            quantity: item.quantity,
            size: item.size || ""
        }));

        res.status(200).json({ cart: cartItems });
    } catch (err) {
        console.error("Error fetching cart:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Remove item from cart
 */
const removeFromCart = async (req, res) => {
    const userId = req.user.userid;
    const { productId } = req.body;

    try {
        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const itemIndex = user.cart.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        if (user.cart[itemIndex].quantity > 1) {
            user.cart[itemIndex].quantity -= 1;
        } else {
            user.cart.splice(itemIndex, 1);
        }

        await user.save();
        res.status(200).json({ message: "Item removed from cart" });
    } catch (err) {
        console.error("Error removing from cart:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Clear cart
 */
const clearCart = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.userid);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        user.cart = [];
        await user.save();

        res.status(200).json({ message: "Cart cleared successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

module.exports = {
    addToCart,
    getCart,
    removeFromCart,
    clearCart
};

