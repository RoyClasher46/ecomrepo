const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    cart:[],
    orders:[],
    picture: String
});

module.exports = mongoose.model("user", userSchema);