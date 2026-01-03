import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Upload, Settings, ShoppingCart, LogOut, Shield } from "lucide-react";
import { toast } from "react-toastify";
import ThemeToggle from "../../components/ThemeToggle";

const Sidebar = ({ setPage, currentPage }) => {
  const navigate = useNavigate();

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

  return (
    <div className="w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen border-r border-gray-700 shadow-2xl flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shadow-lg border border-gray-600">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-xs text-gray-400">ShopEase Control</p>
          </div>
        </div>
        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Theme</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-gray-600 to-gray-500 text-white shadow-lg transform scale-105 border border-gray-400"
                  : "text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
        
        {/* Logout Button */}
        <div className="pt-2 mt-2 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-900/30 hover:bg-red-900/40 text-red-300 hover:text-red-200 transition-all border border-red-800/30 hover:border-red-700/50"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
