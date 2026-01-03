const mongoose = require("mongoose");
const orderModel = require("../models/order-model");

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        // Clean up old indexes if they exist
        try {
            await orderModel.collection.dropIndex('deliveryPartner.trackingId_1');
        } catch (err) {
            // Index doesn't exist, ignore
        }
        try {
            await orderModel.collection.dropIndex('trackingNumber_1');
        } catch (err) {
            // Index doesn't exist, ignore
        }
    } catch (err) {
        console.log("DB Error: ", err);
        process.exit(1);
    }
};

module.exports = connectDB;

