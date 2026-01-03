const express = require("express");
const router = express.Router();
const { handleChat } = require("../controllers/chatController");

// Chat route
router.post("/chat", handleChat);

module.exports = router;

