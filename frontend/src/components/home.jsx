import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Main() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  const handleOrder = () => {
    alert("Please sign in to add items to your cart.");
    navigate("/login");
  };
  const handleclick = () => {
    const hero = document.getElementById("hero");
    if (hero) {
      hero.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,black,#002b36,black)] text-gray-200 relative">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-5 bg-black/80 border-b border-gray-800 backdrop-blur-md">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-200 via-gray-400 to-white bg-clip-text text-transparent">
          ShopEase
        </h1>
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-white transition hover:scale-110">
            Home
          </Link>
          <Link onClick={handleclick} className="hover:text-white transition hover:scale-110">
            Products
          </Link>
          <Link to="/about" className="hover:text-white transition hover:scale-110">
            About
          </Link>
          
          <Link
            to="/login"
            className="px-5 py-2 rounded-lg bg-gray-800 text-white font-semibold border border-gray-700 
                      hover:bg-white hover:text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.9)] transition-all duration-300"
          >
            Sign In
          </Link>

        </div>
      </nav>

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
      <section id="hero" className="px-10 py-20">
        <h3 className="text-4xl font-bold text-center mb-14 bg-gradient-to-r from-gray-100 via-gray-400 to-white bg-clip-text text-transparent ">
          Featured Products
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {products.map((item) => (
            <div
              key={item._id}
              className="bg-gradient-to-r from-gray-800 via-[#002b36] to-[#0d0d0d] rounded-xl border border-gray-700 shadow-lg overflow-hidden hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-transform"
            >
              <img
                src={`data:image/jpeg;base64,${item.image}`}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-5 text-center">
                <h4 className="text-xl font-semibold text-white">{item.name}</h4>
                <p className="text-green-200 font-bold">${item.price}</p>
                <p className="text-gray-400">{item.description}</p>
                <button
                  className="mt-4 px-4 py-2 rounded-lg text-white border border-gray-700 
                  hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.9)] transition"
                  onClick={handleOrder}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-6 mt-16 text-center text-gray-500">
        © {new Date().getFullYear()} ShopEase. All rights reserved.
      </footer>
    </div>
  );
}
