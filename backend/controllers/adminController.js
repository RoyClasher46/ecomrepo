const productModel = require("../models/product-model");
const orderModel = require("../models/order-model");

/**
 * Get admin dashboard statistics
 */
const getStats = async (req, res) => {
    try {
        const totalProducts = await productModel.countDocuments({});
        const totalOrders = await orderModel.countDocuments({});

        const statuses = ["Pending", "Accepted", "Rejected", "Assigned", "Delivered"];
        const statusCounts = {};
        for (const s of statuses) {
            statusCounts[s] = await orderModel.countDocuments({ status: s });
        }

        const returnCounts = {
            requested: await orderModel.countDocuments({ returnStatus: "Requested" }),
            approved: await orderModel.countDocuments({ returnStatus: "Approved" }),
            completed: await orderModel.countDocuments({ returnStatus: "Completed" }),
        };

        res.json({
            totalProducts,
            totalOrders,
            statusCounts,
            returnCounts,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getStats
};

