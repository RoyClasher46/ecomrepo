import React, { useState, useRef, useEffect } from "react";

function Chatbot({ totalPrice }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: `👋 Hello! Your total cart amount is ₹${totalPrice}. Would you like to negotiate or see available discounts?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, cartTotal: totalPrice }),
      });

      const data = await response.json();

      const botReply =
        data.reply ||
        `💡 Reminder: Your cart total is ₹${totalPrice}. Would you like me to suggest offers?`;

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (error) {
      console.error("Error talking to backend:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error connecting to server." },
      ]);
    }

    setLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 w-full h-full flex flex-col rounded-2xl shadow-lg overflow-hidden">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto flex flex-col space-y-1 p-2 bg-white">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "bot" && <div className="text-lg mr-1">🤖</div>}
            <div
              className={`px-2 py-1 rounded-2xl text-sm max-w-[75%] 
                ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white rounded-br-md"
                    : "bg-gray-200 text-black rounded-bl-md"
                }`}
            >
              {msg.text}
            </div>
            {msg.sender === "user" && <div className="text-lg ml-1">🧑‍💻</div>}
          </div>
        ))}

        {loading && (
          <div className="italic text-xs text-gray-400">
            🤖 Bot is typing...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-2 border-t border-gray-300 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your offer..."
          className="flex-1 px-3 py-1 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
        <button
          onClick={handleSend}
          className="px-3 py-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
