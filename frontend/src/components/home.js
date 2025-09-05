import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, LogIn } from "lucide-react";
import headphones from "../assets/products/headphone.jpg";
import watch from "../assets/products/watch.jpg";
import shoes from "../assets/products/shoes.jpg";


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-5 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-indigo-600">ShopEase</h1>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-700 hover:text-indigo-600">
            Home
          </Link>
          <Link to="/products" className="text-gray-700 hover:text-indigo-600">
            Products
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-indigo-600">
            About
          </Link>
          <Link to="/login">
            <LogIn className="w-6 h-6 text-gray-700 hover:text-indigo-600" />
          </Link>
          <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-indigo-600 cursor-pointer" />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-20 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <h2 className="text-5xl font-extrabold mb-4 animate-bounce">
          Welcome to ShopEase
        </h2>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8" >
          {[
                { id: 1, name: "Wireless Headphones", price: "$120", img: headphones },
                { id: 2, name: "Smart Watch", price: "$90", img: watch },
                { id: 3, name: "Running Shoes", price: "$60", img: shoes },
            ].map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform"
            >
              <img src={item.img} alt={item.name} className="w-full h-48 object-cover" />
              <div className="p-4 text-center">
                <h4 className="text-lg font-semibold">{item.name}</h4>
                <p className="text-indigo-600 font-bold">{item.price}</p>
                <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-6 mt-16 shadow-inner text-center text-gray-600">
        © {new Date().getFullYear()} ShopEase. All rights reserved.
      </footer>
    </div>
  );
}
