import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

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
      toast.success("Logout successfully!");
      navigate("/");
    }
  };

  const handleclick = () => {
    navigate("/home");
    setTimeout(() => {
      const hero = document.getElementById("hero");
      if (hero) {
        hero.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 50);
  };

  return (
    <div>
      <nav className="relative z-50 flex justify-between items-center px-6 md:px-10 py-4 bg-white border-b border-gray-200 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold gradient-text">
          ShopEase
        </h1>

        <div className="flex items-center gap-4 md:gap-6 relative">
          <Link
            to="/home"
            className="text-gray-700 hover:text-primary transition-colors font-medium text-sm"
          >
            Home
          </Link>
          <Link
            onClick={handleclick}
            className="text-gray-700 hover:text-primary transition-colors font-medium text-sm"
          >
            Products
          </Link>
          <Link
            to="/about"
            className="text-gray-700 hover:text-primary transition-colors font-medium text-sm"
          >
            About
          </Link>

          <div className="relative">
            <User
              className="w-6 h-6 text-gray-600 hover:text-primary cursor-pointer transition-colors"
              onClick={handleUserClick}
            />
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 modern-card rounded-lg shadow-large z-50 overflow-hidden">
                <button
                  className="w-full px-4 py-3 text-left text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
                  onClick={() => navigate("/myorders")}
                >
                  My Orders
                </button>
                <button
                  className="w-full px-4 py-3 text-left text-gray-700 font-medium hover:bg-gray-50 transition-colors border-t border-gray-100 text-sm"
                  onClick={() => navigate("/usercart")}
                >
                  View Cart
                </button>
                <button
                  className="w-full px-4 py-3 text-left text-gray-700 font-medium hover:bg-gray-50 transition-colors border-t border-gray-100 text-sm"
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