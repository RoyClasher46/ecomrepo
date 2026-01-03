const { GoogleGenerativeAI } = require("@google/generative-ai");

// Store chat history (in-memory for now)
let chatHistory = [
    {
        role: "system",
        content:
            "You are a shopping cart negotiation bot. You should ONLY talk about the total cart value. \
      Never mention specific products like sneakers. Respond politely to offers. \
      Encourage the user to make an offer and negotiate discounts on the total cart amount.",
    },
];

/**
 * Handle chat message
 */
const handleChat = async (req, res) => {
    try {
        if (!req.body || !req.body.message) {
            return res.status(400).json({ reply: "⚠️ No message provided." });
        }

        const { message } = req.body;

        chatHistory.push({ role: "user", content: message });

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const historyPrompt = chatHistory
            .map((m) => `${m.role}: ${m.content}`)
            .join("\n");

        const result = await model.generateContent(historyPrompt);
        const reply = result.response.text();

        chatHistory.push({ role: "assistant", content: reply });

        res.json({ reply });
    } catch (err) {
        console.error("Backend Error:", err);
        res.status(500).json({ reply: "⚠️ Something went wrong." });
    }
};

module.exports = {
    handleChat
};

