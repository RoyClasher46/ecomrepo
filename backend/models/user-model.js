const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  picture: String,
  isAdmin: {
  type: Boolean,
  default: false,
},

  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product", // use the correct model name (usually lowercase if that's what you used)
      },
      quantity: {
        type: Number,
        default: 1,
      },
      size: {
        type: String,
        default: "", // Product size if applicable
      },
    },
  ],

  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order", // optional: if you store order references
    },
  ],
});

module.exports = mongoose.model("user", userSchema);
