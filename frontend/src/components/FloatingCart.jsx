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
        className="fixed bottom-6 right-6 bg-white text-gray-700 p-4 rounded-full shadow-large cursor-pointer 
                   hover:bg-gray-50 hover:shadow-xl transition-all z-50 border border-gray-200"
        onClick={() => setShowCartPopup(!showCartPopup)}
      >
        <ShoppingCart size={24} />
        {totalItems > 0 && (
          <span className="absolute top-0 right-0 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {totalItems}
          </span>
        )}
      </div>

      {/* Cart Popup */}
      {showCartPopup && (
        <div className="fixed bottom-20 right-6 w-80 modern-card rounded-lg shadow-large z-50">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
            <h4 className="font-bold text-lg text-gray-900">Cart</h4>
            <X
              className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer transition"
              onClick={() => setShowCartPopup(false)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto px-4 py-2">
            {cartItems.length === 0 ? (
              <p className="text-sm text-gray-600 py-4">Your cart is empty.</p>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center mb-3 p-2 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-600">
                      ₹{item.price} × {item.quantity}
                      {item.size && <span className="ml-1">({item.size})</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-xs text-error hover:text-error-dark transition px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <button
                onClick={handleCart}
                className="w-full px-4 py-2 rounded-lg modern-button font-semibold text-sm"
              >
                View Cart
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

