const orderModel = require("../models/order-model");
const userModel = require("../models/user-model");
const productModel = require("../models/product-model");

// Return Policy Settings (in-memory, could be moved to DB)
let returnPolicySettings = {
    returnDays: 7, // Default 7 days
};

/**
 * Create new order
 */
const createOrder = async (req, res) => {
    const {
        productId,
        quantity,
        size,
        addressLine,
        area,
        city,
        state,
        pincode,
        deliveryPhone,
        paymentType,
        paymentMethod,
        paymentId,
        paymentAmount,
        paymentStatus,
        paymentVerified,
    } = req.body;

    try {
        const user = await userModel.findById(req.user.userid);
        if (!user) return res.status(400).json({ message: "User not found" });

        if (!addressLine || String(addressLine).trim().length < 5) {
            return res.status(400).json({ message: "Address is required" });
        }
        if (!city || String(city).trim().length < 2) {
            return res.status(400).json({ message: "City is required" });
        }
        if (!state || String(state).trim().length < 2) {
            return res.status(400).json({ message: "State is required" });
        }
        if (!pincode || String(pincode).trim().length < 4) {
            return res.status(400).json({ message: "Pincode is required" });
        }
        if (!deliveryPhone || String(deliveryPhone).trim().length < 6) {
            return res.status(400).json({ message: "Mobile number is required" });
        }

        const fullAddress = [
            String(addressLine).trim(),
            area ? String(area).trim() : "",
            String(city).trim(),
            String(state).trim(),
            String(pincode).trim(),
        ].filter(Boolean).join(", ");

        const newOrder = await orderModel.create({
            productId,
            quantity,
            size: size || "",
            status: "Pending",
            userId: req.user.userid,
            addressLine: String(addressLine).trim(),
            area: area ? String(area).trim() : "",
            city: String(city).trim(),
            state: String(state).trim(),
            pincode: String(pincode).trim(),
            deliveryAddress: fullAddress,
            deliveryPhone: String(deliveryPhone).trim(),
            paymentType: paymentType || "Cash on Delivery",
            paymentMethod: paymentMethod || "Cash",
            paymentId: paymentId || "",
            paymentAmount: paymentAmount || 0,
            paymentStatus: paymentStatus || (paymentType === "Online" ? "Paid" : "Pending"),
            paymentVerified: paymentVerified || false,
        });
        user.orders.push(newOrder._id);
        await user.save();

        res.status(200).json({ message: "Order placed successfully", orderId: newOrder._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Get user's orders
 */
const getMyOrders = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ userId: req.user.userid })
            .populate("productId", "name price image description")
            .sort({ createdAt: -1 });

        const formattedOrders = orders.map(order => {
            const orderObj = order.toObject();
            if (orderObj.productId && orderObj.productId.image) {
                const path = require("path");
                // Handle both Buffer (old) and String (new) formats
                if (Buffer.isBuffer(orderObj.productId.image)) {
                    orderObj.productId.image = `data:image/jpeg;base64,${orderObj.productId.image.toString("base64")}`;
                } else if (typeof orderObj.productId.image === 'string') {
                    orderObj.productId.image = orderObj.productId.image.startsWith('/uploads/') 
                        ? orderObj.productId.image 
                        : `/uploads/products/${path.basename(orderObj.productId.image)}`;
                }
            }
            return orderObj;
        });

        res.status(200).json(formattedOrders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Get all orders (Admin)
 */
const getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel
            .find()
            .populate("productId", "name price")
            .populate("userId", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Update order status
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const updateData = { status };
        if (status === "Delivered") {
            updateData.deliveredDate = new Date();
        }

        const order = await orderModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate("productId", "name price")
            .populate("userId", "name email");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Assign delivery partner to order
 */
const assignDelivery = async (req, res) => {
    try {
        const { deliveryPartnerName, deliveryPartnerPhone, estimatedDelivery } = req.body;
        if (!deliveryPartnerName || String(deliveryPartnerName).trim().length < 2) {
            return res.status(400).json({ message: "Delivery partner name is required" });
        }
        if (!deliveryPartnerPhone || String(deliveryPartnerPhone).trim().length < 6) {
            return res.status(400).json({ message: "Delivery partner phone is required" });
        }

        const trackingId = `TRK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const defaultEstimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        const estimatedDeliveryDate = estimatedDelivery ? new Date(estimatedDelivery) : null;
        if (estimatedDeliveryDate) {
            if (isNaN(estimatedDeliveryDate.getTime())) {
                return res.status(400).json({ message: "Invalid estimated delivery date" });
            }
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            if (estimatedDeliveryDate < startOfToday) {
                return res.status(400).json({ message: "Estimated delivery date cannot be in the past" });
            }
        }

        const order = await orderModel.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (order.status !== "Accepted" && order.status !== "Assigned") {
            return res.status(400).json({ message: "Order must be Accepted before assigning delivery" });
        }

        order.deliveryPartnerName = String(deliveryPartnerName).trim();
        order.deliveryPartnerPhone = String(deliveryPartnerPhone).trim();
        order.trackingId = order.trackingId || trackingId;
        if (!order.estimatedDelivery) {
            order.estimatedDelivery = estimatedDeliveryDate && !isNaN(estimatedDeliveryDate.getTime())
                ? estimatedDeliveryDate
                : defaultEstimatedDelivery;
        }
        if (order.status === "Accepted") order.status = "Assigned";

        await order.save();

        const populated = await orderModel
            .findById(order._id)
            .populate("productId", "name price")
            .populate("userId", "name email");

        res.json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Request return for order
 */
const requestReturn = async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason || String(reason).trim().length < 10) {
            return res.status(400).json({ message: "Return reason must be at least 10 characters" });
        }

        const order = await orderModel.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.userId.toString() !== req.user.userid.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (order.status !== "Delivered") {
            return res.status(400).json({ message: "Only delivered orders can be returned" });
        }

        if (order.returnStatus !== "None") {
            return res.status(400).json({ message: "Return already requested or processed" });
        }

        if (!order.deliveredDate) {
            return res.status(400).json({ message: "Order delivery date not found" });
        }

        const deliveredDate = new Date(order.deliveredDate);
        const daysSinceDelivery = Math.floor((Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceDelivery > returnPolicySettings.returnDays) {
            return res.status(400).json({
                message: `Return period expired. You can only return within ${returnPolicySettings.returnDays} days of delivery.`
            });
        }

        order.returnStatus = "Requested";
        order.returnReason = String(reason).trim();
        order.returnRequestDate = new Date();
        await order.save();

        const populated = await orderModel
            .findById(order._id)
            .populate("productId", "name price")
            .populate("userId", "name email");

        res.json({ message: "Return request submitted successfully", order: populated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Update return status (Admin)
 */
const updateReturnStatus = async (req, res) => {
    try {
        const { returnStatus } = req.body;

        if (!["Approved", "Rejected", "Completed"].includes(returnStatus)) {
            return res.status(400).json({ message: "Invalid return status. Must be Approved, Rejected, or Completed" });
        }

        const order = await orderModel.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (returnStatus === "Completed") {
            if (order.returnStatus !== "Approved") {
                return res.status(400).json({
                    message: "Only approved returns can be marked as completed"
                });
            }
        } else {
            if (order.returnStatus !== "Requested") {
                return res.status(400).json({
                    message: "Order return is not in requested status"
                });
            }
        }

        order.returnStatus = returnStatus;
        if (returnStatus === "Approved") {
            order.returnApprovedDate = new Date();
        }
        await order.save();

        const populated = await orderModel
            .findById(order._id)
            .populate("productId", "name price")
            .populate("userId", "name email");

        res.json({ message: `Return ${returnStatus.toLowerCase()} successfully`, order: populated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Verify payment (Admin)
 */
const verifyPayment = async (req, res) => {
    try {
        const { paymentStatus } = req.body;

        if (!["Paid", "Failed"].includes(paymentStatus)) {
            return res.status(400).json({ message: "Invalid payment status. Must be Paid or Failed" });
        }

        const order = await orderModel.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.paymentStatus = paymentStatus;
        order.paymentVerified = true;
        order.paymentVerifiedAt = new Date();
        await order.save();

        const populated = await orderModel
            .findById(order._id)
            .populate("productId", "name price")
            .populate("userId", "name email");

        res.json({ message: `Payment ${paymentStatus.toLowerCase()} verified successfully`, order: populated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Get return policy
 */
const getReturnPolicy = async (req, res) => {
    try {
        res.json(returnPolicySettings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Update return policy (Admin)
 */
const updateReturnPolicy = async (req, res) => {
    try {
        const { returnDays } = req.body;
        if (!returnDays || returnDays < 1 || returnDays > 365) {
            return res.status(400).json({ message: "Return days must be between 1 and 365" });
        }
        returnPolicySettings.returnDays = parseInt(returnDays);
        res.json({ message: "Return policy updated successfully", returnPolicy: returnPolicySettings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    assignDelivery,
    requestReturn,
    updateReturnStatus,
    verifyPayment,
    getReturnPolicy,
    updateReturnPolicy,
    returnPolicySettings
};

