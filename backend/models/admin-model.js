const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    product:{
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
        image: { data: Buffer, contentType: String }
        },
    order:{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        status: { type: String, default: "Pending" }, // Pending, Accepted, Rejected
        createdAt: { type: Date, default: Date.now }
      },
      
});

module.exports = mongoose.model("admin", adminSchema);