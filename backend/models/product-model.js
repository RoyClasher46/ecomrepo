const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    description: String,
    image : Buffer,
    name: String,
    price: Number,
    discount:{
        type: Number,
        default: 0
    },
    createdAt: { type: Date, default: Date.now },
    bgcolor: String,
    panelcolor: String,
    textcolor: String,
});

module.exports= mongoose.model("product",productSchema);