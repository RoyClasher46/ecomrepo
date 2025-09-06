import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, X } from "lucide-react";

export default function Main() {
  const [products, setProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
     
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

  const handleUserClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleOrder = async (productId) => {
    try {
      const res = await fetch("http://localhost:5000/api/add-to-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId })
      });

      const data = await res.json();

      if (res.ok) {
        await loadCart();
        setShowCartPopup(true);
        alert("Item added to cart");
      } else {
        alert(data.message || "Failed to add item to cart");
      }
    } catch (err) {
      console.error("Add to cart failed", err);
      alert("An error occurred while adding to cart");
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
        alert("Item removed from cart");
      } else {
        alert(data.message || "Failed to remove item from cart");
      }
    } catch (err) {
      console.error("Remove from cart failed", err);
      alert("An error occurred while removing item from cart");
    }
  };

  const handleLogout = async () => {
    const res = await fetch("http://localhost:5000/api/logout", {
      method: "GET",
      credentials: "include"
    });
    if (res.ok) {
      alert("Logout successfully!");
      navigate("/");
    }
  };

  const handleCart = () => {
    navigate("/usercart");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 relative">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-5 bg-white shadow-md relative">
        <h1 className="text-2xl font-bold text-indigo-600">ShopEase</h1>
        <div className="flex items-center gap-6 relative">
          <Link to="/" className="text-gray-700 hover:text-indigo-600">Home</Link>
          <Link to="/products" className="text-gray-700 hover:text-indigo-600">Products</Link>
          <Link to="/about" className="text-gray-700 hover:text-indigo-600">About</Link>

          {/* User Icon with dropdown */}
          <div className="relative">
            <User
              className="w-6 h-6 text-gray-700 hover:text-indigo-600 cursor-pointer"
              onClick={handleUserClick}
            />
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-10">
                <button
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                  onClick={() => navigate("/myorders")}
                >
                  MyOrders
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                  onClick={() => navigate("/usercart")}
                >
                  ViewCart
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-20 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <h2 className="text-5xl font-extrabold mb-4 animate-bounce">Welcome to ShopEase</h2>
        <p className="max-w-xl mb-6 text-lg">
          Discover the best deals on fashion, electronics, and home essentials.
        </p>
        <Link
          to="/products"
          className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl shadow-md hover:bg-gray-100 transition"
        >
          Shop Now
        </Link>
      </section>

      {/* Product Highlights */}
      <section className="px-10 py-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800">
          Featured Products
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform"
            >
              <img
                src={`data:image/jpeg;base64,${item.image}`}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 text-center">
                <h4 className="text-lg font-semibold">{item.name}</h4>
                <p className="text-indigo-600 font-bold">${item.price}</p>
                <div>
                  <button
                    className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg cursor-pointer hover:bg-indigo-700 transition z-50"
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
        <div className="fixed bottom-20 right-6 w-80 bg-white border rounded-lg shadow-xl z-50">
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <h4 className="font-bold text-lg text-gray-800">Cart</h4>
            <X
              className="w-5 h-5 text-gray-500 hover:text-red-500 cursor-pointer"
              onClick={() => setShowCartPopup(false)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto px-4 py-2">
            {cartItems.length === 0 ? (
              <p className="text-sm text-gray-500">Your cart is empty.</p>
            ) : (
              cartItems.map(item => (
                <div key={item._id} className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium text-gray-700">{item.name}</p>
                    <p className="text-sm text-gray-500">${item.price} × {item.quantity}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-3 border-t">
            <button
              onClick={handleCart}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              View Cart
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white py-6 mt-16 shadow-inner text-center text-gray-600">
        © {new Date().getFullYear()} ShopEase. All rights reserved.
      </footer>
    </div>
  );
}
