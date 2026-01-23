import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, ShoppingCart, Menu, X, Package, LogOut, Home, Grid3x3, UserCircle, Mail, Search, Info } from "lucide-react";
import { toast } from 'react-toastify';
import ThemeToggle from "./ThemeToggle";
import { getImageSrc } from "../utils/imageUtils";
import { useAuth } from "../contexts/AuthContext";
import "react-toastify/dist/ReactToastify.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const isLoggedIn = !!user;
  const userName = user?.name || "";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const res = await fetch("/api/get-cart", { credentials: "include" });
        const data = await res.json();
        if (res.ok && data.cart) {
          const total = data.cart.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(total);
        }
      } catch (err) {
        // User not logged in or error
      }
    };

    if (isLoggedIn) {
      loadCart();
    }
  }, [isLoggedIn]);

  const performSearch = async (query) => {
    try {
      const res = await fetch("/products");
      const data = await res.json();
      const filtered = data.filter(
        (p) =>
          p.name?.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase()) ||
          p.category?.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length > 0) {
      navigate(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearchDropdown(false);
    }
  };

  const handleUserClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    setShowDropdown(false);
    try {
      const res = await fetch("/api/logout", {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Logout successfully!");
        logout(); // Build-in logout from context
        navigate("/");
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
      ? 'bg-white/80 dark:bg-gray-950/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-800/50'
      : 'bg-white/60 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200/30 dark:border-gray-800/30'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary dark:bg-accent flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-105">
              <span className="text-white text-xl md:text-2xl font-bold">S</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold gradient-text">
                ShopEase
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">Premium Shopping</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-accent transition-all font-medium text-sm flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              to="/category/all"
              className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-accent transition-all font-medium text-sm flex items-center gap-2"
            >
              <Grid3x3 className="w-4 h-4" />
              Products
            </Link>
            <Link
              to="/about"
              className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-accent transition-all font-medium text-sm flex items-center gap-2"
            >
              <Info className="w-4 h-4" />
              About
            </Link>
            <Link
              to="/contact"
              className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-accent transition-all font-medium text-sm flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Contact
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block relative flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  const query = e.target.value;
                  setSearchQuery(query);
                  if (query.trim().length > 0) {
                    performSearch(query);
                    setShowSearchDropdown(true);
                  } else {
                    setShowSearchDropdown(false);
                    setSearchResults([]);
                  }
                }}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) {
                    setShowSearchDropdown(true);
                  }
                }}
                onBlur={() => {
                  // Delay to allow click on results
                  setTimeout(() => setShowSearchDropdown(false), 200);
                }}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent transition-all outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </form>
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-950 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 max-h-96 overflow-y-auto">
                {searchResults.slice(0, 8).map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    onClick={() => {
                      setSearchQuery("");
                      setShowSearchDropdown(false);
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    {product.image && (
                      <img
                        src={getImageSrc(product.image)}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{product.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">₹{product.price}</p>
                    </div>
                  </Link>
                ))}
                {searchResults.length > 8 && (
                  <div className="p-3 text-center border-t border-gray-200">
                    <Link
                      to={`/category/all?search=${encodeURIComponent(searchQuery)}`}
                      onClick={() => {
                        setSearchQuery("");
                        setShowSearchDropdown(false);
                      }}
                      className="text-sm text-primary dark:text-accent hover:text-primary-dark dark:hover:text-accent-dark font-medium"
                    >
                      View all {searchResults.length} results
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle className="hidden md:flex" />

            {/* Cart Icon - Only show when logged in */}
            {isLoggedIn && (
              <Link
                to="/usercart"
                className="relative p-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-accent transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary dark:bg-accent text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Profile Menu / Sign In */}
            <div className="relative hidden md:block">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={handleUserClick}
                    className="p-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-accent transition-all"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-64 modern-card dark:bg-gray-950 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-up border border-gray-200 dark:border-gray-800">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary dark:bg-accent flex items-center justify-center text-white font-bold">
                            {userName ? userName.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{userName || "User"}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">My Account</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-accent transition-all rounded-lg flex items-center gap-3 text-sm"
                          onClick={() => {
                            navigate("/profile");
                            setShowDropdown(false);
                          }}
                        >
                          <UserCircle className="w-4 h-4" />
                          Edit Profile
                        </button>
                        <button
                          className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-accent transition-all rounded-lg flex items-center gap-3 text-sm"
                          onClick={() => {
                            navigate("/myorders");
                            setShowDropdown(false);
                          }}
                        >
                          <Package className="w-4 h-4" />
                          My Orders
                        </button>
                        <button
                          className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-accent transition-all rounded-lg flex items-center gap-3 text-sm"
                          onClick={() => {
                            navigate("/usercart");
                            setShowDropdown(false);
                          }}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          View Cart
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          className="w-full px-4 py-3 text-left text-red-600 font-medium hover:bg-red-50 transition-all rounded-lg flex items-center gap-3 text-sm"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg modern-button font-semibold text-sm flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>

            {/* Theme Toggle - Mobile */}
            <ThemeToggle className="md:hidden" />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 backdrop-blur-xl animate-fade-in-up">
          <div className="px-4 py-4 space-y-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    const query = e.target.value;
                    setSearchQuery(query);
                    if (query.trim().length > 0) {
                      performSearch(query);
                    } else {
                      setSearchResults([]);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent transition-all outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
                  {searchResults.slice(0, 5).map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      onClick={() => {
                        setSearchQuery("");
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      {product.image && (
                        <img
                          src={getImageSrc(product.image)}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">{product.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">₹{product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </form>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-accent transition-all font-medium text-base"
            >
              Home
            </Link>
            <Link
              to="/category/all"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-accent transition-all font-medium text-base"
            >
              Products
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-accent transition-all font-medium flex items-center gap-2 text-base"
            >
              <Info className="w-4 h-4" />
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-accent transition-all font-medium text-base"
            >
              Contact
            </Link>
            {isLoggedIn ? (
              <>
                <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-accent transition-all font-medium flex items-center gap-3 text-base"
                >
                  <UserCircle className="w-4 h-4" />
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    navigate("/myorders");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-accent transition-all font-medium flex items-center gap-3 text-base"
                >
                  <Package className="w-4 h-4" />
                  My Orders
                </button>
                <button
                  onClick={() => {
                    navigate("/usercart");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-accent transition-all font-medium flex items-center gap-3 text-base"
                >
                  <ShoppingCart className="w-4 h-4" />
                  View Cart
                </button>
                <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium flex items-center gap-3 text-base"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg modern-button font-semibold text-center flex items-center justify-center gap-2 text-base"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg border-2 border-primary dark:border-accent text-primary dark:text-accent hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-semibold text-center text-base"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;