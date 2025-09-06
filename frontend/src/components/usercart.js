import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, MessageSquare } from "lucide-react";
import Chatbot from "./chatbot";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [finalPrice, setFinalPrice] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();

  const loadCart = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/get-cart", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setCartItems(data.cart);
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setFinalPrice(total);
  }, [cartItems]);

  const removeFromCart = async (id) => {
    try {
      const res = await fetch("http://localhost:5000/api/remove-to-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: id }),
      });
      if (res.ok) await loadCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrderNow = async () => {
    try {
      const orderPromises = cartItems.map((item) =>
        fetch("http://localhost:5000/api/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId: item._id, quantity: item.quantity }),
        })
      );
      await Promise.all(orderPromises);
      alert(`Order placed! Total price: ₹${finalPrice}`);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-6 relative">
      <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-10 drop-shadow-lg">
        Your Shopping Cart
      </h1>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.length === 0 ? (
            <p className="text-gray-500 text-lg">
              Your cart is empty. Start shopping now!
            </p>
          ) : (
            cartItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-xl p-4 flex items-center justify-between gap-4"
              >
                <img
                  src={`data:image/jpeg;base64,${item.image}`}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {item.name}
                  </h2>
                  <p className="text-gray-500">{item.description}</p>
                  <p className="mt-1 text-indigo-600 font-bold text-lg">
                    ₹{item.price} × {item.quantity} = ₹
                    {item.price * item.quantity}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={24} />
                </button>
              </div>
            ))
          )}

          {cartItems.length > 0 && (
            <div className="space-y-4">
              <p className="text-right text-indigo-700 font-bold text-xl">
                Total Price: ₹{finalPrice}
              </p>
              <button
                onClick={handleOrderNow}
                className="w-full py-4 text-white font-bold rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 shadow-lg transition duration-300"
              >
                Order Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chatbot Icon */}
      <div
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg cursor-pointer hover:bg-indigo-700 transition z-50"
        onClick={() => setShowChat(!showChat)}
      >
        <MessageSquare size={28} />
      </div>

      {/* Chatbot Box */}
      {showChat && (
        <div className="fixed bottom-20 right-6 w-96 h-[60vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50">
          <div className="flex justify-between items-center p-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Chatbot</h2>
            <button
              onClick={() => setShowChat(false)}
              className="text-gray-500 hover:text-red-500"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Chatbot totalPrice={finalPrice} />
          </div>
        </div>
      )}
    </div>
  );
}
