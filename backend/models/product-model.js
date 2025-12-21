const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },  // or ObjectId if you have User model
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
    name: String,
    image : Buffer,
    description: String,
    price: Number,
    category: {
        type: String,
        default: "Self"
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    discount:{
        type: Number,
        default: 0
    },
    createdAt: { type: Date, default: Date.now },
    reviews: [reviewSchema],

});

module.exports= mongoose.model("product",productSchema);