import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, X } from "lucide-react";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

export default function FloatingCart() {
  const [cartItems, setCartItems] = useState([]);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const navigate = useNavigate();

  const loadCart = async () => {
    try {
      const res = await fetch("/api/get-cart", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.cart) {
        setCartItems(data.cart);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      setCartItems([]);
    }
  };

  useEffect(() => {
    loadCart();
    // Refresh cart every 2 seconds
    const interval = setInterval(loadCart, 2000);
    return () => clearInterval(interval);
  }, []);

  const removeFromCart = async (id) => {
    try {
      const res = await fetch("/api/remove-to-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: id }),
      });

      if (res.ok) {
        await loadCart();
        toast.success("Item removed from cart");
      } else {
        toast.error("Failed to remove item from cart");
      }
    } catch (err) {
      console.error("Remove from cart failed", err);
      toast.error("An error occurred");
    }
  };

  const handleCart = () => {
    navigate("/usercart");
    setShowCartPopup(false);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Floating Cart Icon */}
      <div
        className="fixed bottom-6 right-6 bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-4 rounded-2xl shadow-2xl cursor-pointer 
                   hover:shadow-glow-lg hover:scale-110 transition-all z-50 border border-white/20 backdrop-blur-sm"
        onClick={() => setShowCartPopup(!showCartPopup)}
      >
        <ShoppingCart size={24} />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white">
            {totalItems}
          </span>
        )}
      </div>

      {/* Cart Popup */}
      {showCartPopup && (
        <div className="fixed bottom-24 right-6 w-80 modern-card rounded-2xl shadow-2xl z-50 animate-scale-in">
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
            <h4 className="font-bold text-lg gradient-text">Shopping Cart</h4>
            <X
              className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer transition hover:rotate-90"
              onClick={() => setShowCartPopup(false)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto px-4 py-3">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Your cart is empty.</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center mb-3 p-3 bg-gradient-to-r from-gray-50 to-indigo-50/30 rounded-xl hover:shadow-md transition-all"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      ₹{item.price} × {item.quantity}
                      {item.size && <span className="ml-1 text-indigo-600">({item.size})</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 transition px-3 py-1.5 rounded-lg font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="px-4 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={handleCart}
                className="w-full px-4 py-3 rounded-xl modern-button font-semibold text-sm flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                View Full Cart
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

