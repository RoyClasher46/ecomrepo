import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ setPage }) => {

   const navigate = useNavigate();

    const handleLogout = async() => {
    const res= await fetch("/api/logout", {
      method: "GET",
      credentials: "include"
    });
    const data = await res.json();
    if (res.ok) {
         alert("logout successfully!");
         navigate("/adminlogin",{ replace: true }); // redirect to login page
      }
}
  return (
    <div className="w-64 bg-white text-gray-700 p-6 min-h-screen border-r border-gray-200 shadow-sm">
      <h1 className="text-2xl font-bold gradient-text mb-6">Admin Panel</h1>
      <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
        <li className="hover:bg-gray-50 rounded-lg transition px-4 py-3 cursor-pointer mb-2 text-sm font-medium" onClick={() => setPage("dashboard")}>📊 Dashboard</li>
        <li className="hover:bg-gray-50 rounded-lg transition px-4 py-3 cursor-pointer mb-2 text-sm font-medium" onClick={() => setPage("listed")}>📋 Listed Products</li>
        <li className="hover:bg-gray-50 rounded-lg transition px-4 py-3 cursor-pointer mb-2 text-sm font-medium" onClick={() => setPage("upload")}>📤 Upload Product</li>
        <li className="hover:bg-gray-50 rounded-lg transition px-4 py-3 cursor-pointer mb-2 text-sm font-medium" onClick={() => setPage("manage")}>⚙️ Manage Products</li>
        <li className="hover:bg-gray-50 rounded-lg transition px-4 py-3 cursor-pointer mb-2 text-sm font-medium" onClick={() => setPage("orders")}>📦 Orders</li>
        <button className="w-full text-left text-error hover:bg-gray-50 rounded-lg transition px-4 py-3 mt-4 text-sm font-medium" onClick={handleLogout}>🚪 Logout</button>
      </ul>
    </div>
  );
};

export default Sidebar;
