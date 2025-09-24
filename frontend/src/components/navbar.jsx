import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleUserClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    const res = await fetch("http://localhost:5000/api/logout", {
      method: "GET",
      credentials: "include",
    });
    if (res.ok) {
      alert("Logout successfully!");
      navigate("/");
    }
  };

  const handleclick = () => {
    const hero = document.getElementById("hero");
    if (hero) {
      hero.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      <nav className="relative z-50 flex justify-between items-center px-10 py-5 bg-black/80 border-b border-gray-800 backdrop-blur-md">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-200 via-gray-400 to-white bg-clip-text text-transparent">
          ShopEase
        </h1>

        <div className="flex items-center gap-6 relative">
          <Link
            to="/home"
            className="hover:text-white transition hover:scale-110"
          >
            Home
          </Link>
          <Link
            onClick={handleclick}
            className="hover:text-white transition hover:scale-110"
          >
            Products
          </Link>
          <Link
            to="/about"
            className="hover:text-white transition hover:scale-110"
          >
            About
          </Link>

          <div className="relative">
            <User
              className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition"
              onClick={handleUserClick}
            />
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-black border border-gray-800 rounded-lg shadow-lg z-50">
                <button
                  className="w-full px-4 py-2 text-left text-gray-300 font-medium hover:bg-white hover:text-black hover:border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all duration-200 rounded-md"
                  onClick={() => navigate("/myorders")}
                >
                  My Orders
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-gray-300 font-medium hover:bg-white hover:text-black hover:border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all duration-200 rounded-md"
                  onClick={() => navigate("/usercart")}
                >
                  View Cart
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-gray-300 font-medium hover:bg-white hover:text-black hover:border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all duration-200 rounded-md"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;