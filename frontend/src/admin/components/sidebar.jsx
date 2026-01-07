import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Upload, Settings, ShoppingCart, LogOut, Shield, Menu, X } from "lucide-react";
import { toast } from "react-toastify";
import ThemeToggle from "../../components/ThemeToggle";

const Sidebar = ({ setPage, currentPage }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async() => {
    const res = await fetch("/api/logout", {
      method: "GET",
      credentials: "include"
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Logout successful!");
      navigate("/adminlogin", { replace: true });
    }
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "listed", label: "Listed Products", icon: Package },
    { id: "upload", label: "Upload Product", icon: Upload },
    { id: "manage", label: "Manage Products", icon: Settings },
    { id: "orders", label: "Orders", icon: ShoppingCart },
  ];

  const handlePageChange = (pageId) => {
    setPage(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen border-r border-gray-200 dark:border-gray-800 shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo Section */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary dark:bg-accent flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Admin Panel</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">ShopEase Control</p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Theme</span>
            <ThemeToggle />
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-3 sm:p-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base ${
                  isActive
                    ? "bg-primary dark:bg-accent text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-accent"
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
          
          {/* Logout Button */}
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all border border-red-200 dark:border-red-800/30 hover:border-red-300 dark:hover:border-red-700/50 text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
