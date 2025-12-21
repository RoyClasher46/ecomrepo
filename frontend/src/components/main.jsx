import React, { useState, useEffect } from "react";
import Navbar from "./navbar";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, X } from "lucide-react";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

export default function Main() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));

    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/get-cart", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.cart) {
        setCartItems(data.cart);
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  };

  const handleOrder = async (productId) => {
    try {
      const res = await fetch("http://localhost:5000/api/add-to-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (res.ok) {
        await loadCart();
        setShowCartPopup(true);
        toast.error("Item added to cart");
      } else {
        toast.error(data.message || "Failed to add item to cart");
      }
    } catch (err) {
      console.error("Add to cart failed", err);
      toast.error("An error occurred while adding to cart");
    }
  };

  const removeFromCart = async (id) => {
    try {
      const res = await fetch("http://localhost:5000/api/remove-to-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: id }),
      });

      const data = await res.json();

      if (res.ok) {
        await loadCart();
        setShowCartPopup(true);
        toast.error("Item removed from cart");
      } else {
        toast.error(data.message || "Failed to remove item from cart");
      }
    } catch (err) {
      console.error("Remove from cart failed", err);
      toast.error("An error occurred while removing item from cart");
    }
  };

  const handleCart = () => {
    navigate("/usercart");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,black,#002b36,black)] text-gray-200 relative">
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-32 px-6 relative overflow-hidden">
              {/* Neon radial background */}
              <div className="absolute inset-0 -z-10 flex items-center justify-center">
                <div className="w-[800px] h-[800px] bg-gradient-radial from-gray-700/40 via-transparent to-black rounded-full blur-3xl opacity-60"></div>
              </div>
      
              <h2 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-gray-100 via-gray-400 to-white bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]">
                Welcome to ShopEase
              </h2>
              <p className="max-w-2xl mb-8 text-lg text-gray-400">
                Discover the best deals on fashion, electronics, and home essentials.
              </p>
              <Link
                to="/products"
                className="px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold border border-gray-700 
                hover:bg-white hover:text-black hover:shadow-[0_0_25px_rgba(255,255,255,0.9)] transition"
              >
                Shop Now
              </Link>
            </section>

      {/* Product Highlights */}
      <section id="hero" className="px-10 py-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          Featured Products
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((item) => (
            <div
              key={item._id}
              onClick={() => navigate(`/product/${item._id}`)}
              className="bg-gradient-to-r from-gray-800 via-[#002b36] to-[#0d0d0d] rounded-xl border border-gray-700 shadow-lg overflow-hidden 
                         hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-transform"
            >
              <img
                src={`data:image/jpeg;base64,${item.image}`}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 text-center">
                <h4 className="text-lg font-semibold text-white">{item.name}</h4>
                <p className="text-indigo-400 font-bold">${item.price}</p>
                <p className="text-gray-400">{item.description}</p>
                <div>
                  <button
                    className="mt-3 px-4 py-2 rounded-lg bg-gray-800 text-white font-semibold border border-gray-700 
                               hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] transition-all duration-300"
                    onClick={() => handleOrder(item._id)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Cart Icon */}
      <div
        className="fixed bottom-6 right-6 bg-gray-800 text-white p-4 rounded-full shadow-lg cursor-pointer 
                   hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.8)] transition z-50"
        onClick={() => setShowCartPopup(!showCartPopup)}
      >
        <ShoppingCart size={28} />
        {cartItems.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {cartItems.length}
          </span>
        )}
      </div>

      {/* Cart Popup */}
      {showCartPopup && (
        <div className="fixed bottom-20 right-6 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
            <h4 className="font-bold text-lg text-white">Cart</h4>
            <X
              className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer"
              onClick={() => setShowCartPopup(false)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto px-4 py-2">
            {cartItems.length === 0 ? (
              <p className="text-sm text-gray-400">Your cart is empty.</p>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center mb-2"
                >
                  <div>
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-sm text-gray-400">
                      ${item.price} × {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-xs text-red-400 hover:text-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-3 border-t border-gray-700">
            <button
              onClick={handleCart}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white font-semibold border border-gray-700 
                         hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] transition-all duration-300"
            >
              View Cart
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-6 mt-16 text-center text-gray-500">
        © {new Date().getFullYear()} ShopEase. All rights reserved.
      </footer>
    </div>
  );
}
