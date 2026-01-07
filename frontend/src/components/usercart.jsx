import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import Navbar from "./navbar";
import Footer from "./Footer";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [finalPrice, setFinalPrice] = useState(0);
  const navigate = useNavigate();

  const loadCart = async () => {
    try {
      const res = await fetch("/api/get-cart", {
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
      const res = await fetch("/api/remove-to-cart", {
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

  const handleOrderNow = () => {
    navigate("/checkout");
  };

  return (
    <>  
    <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col pt-24 md:pt-28">
      <div className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-10">
            Your Shopping Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.length === 0 ? (
                <div className="modern-card p-8 rounded-lg text-center">
                  <p className="text-gray-600 text-lg">
                    Your cart is empty. Start shopping now!
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                  key={item._id}
                  className="modern-card rounded-lg p-4 flex items-center justify-between gap-4"
                  >
                    <img
                      src={`data:image/jpeg;base64,${item.image}`}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                      />
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">
                        {item.name}
                      </h2>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                      {item.size && (
                        <p className="text-gray-600 text-sm mb-2">
                          Size: <span className="font-medium">{item.size}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                          <button
                            onClick={async () => {
                              await removeFromCart(item._id);
                              toast.info("Quantity decreased");
                            }}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="px-4 py-1 text-gray-900 font-medium min-w-[3rem] text-center">{item.quantity}</span>
                          <button
                            onClick={async () => {
                              await fetch("/api/add-to-cart", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({ productId: item._id, size: item.size || "" }),
                              });
                              await loadCart();
                              toast.success("Quantity increased");
                            }}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg transition"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-primary dark:text-accent font-bold text-lg">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-error hover:text-error-dark transition p-2 hover:bg-gray-50 rounded-lg"
                      >
                      <X size={24} />
                    </button>
                  </div>
                ))
              )}

              {cartItems.length > 0 && (
                <div className="space-y-4">
                  <div className="modern-card p-4 rounded-lg">
                    <p className="text-right text-gray-900 dark:text-gray-100 font-bold text-2xl">
                      Total Price: <span className="text-primary dark:text-accent">₹{finalPrice.toFixed(2)}</span>
                    </p>
                  </div>
                  <button
                    onClick={handleOrderNow}
                    className="w-full py-4 text-white font-bold rounded-lg modern-button shadow-large"
                    >
                    Order Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
}
