import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ setPage }) => {

   const navigate = useNavigate();

    const handleLogout = async() => {
    const res= await fetch("http://localhost:5000/api/logout", {
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
    <div className="w-64 bg-gray-800 text-white p-6">
      <h1 className="text-indigo-400">Admin Panel</h1>
      <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
        <li className="hover:bg-gray-700" style={{ margin: "15px 0", cursor: "pointer" }} onClick={() => setPage("dashboard")}>Dashboard</li>
        <li className="hover:bg-gray-700" style={{ margin: "15px 0", cursor: "pointer" }} onClick={() => setPage("upload")}>Upload Product</li>
        <li className="hover:bg-gray-700" style={{ margin: "15px 0", cursor: "pointer" }} onClick={() => setPage("manage")}>Manage Products</li>
        <li className="hover:bg-gray-700" style={{ margin: "15px 0", cursor: "pointer" }} onClick={() => setPage("orders")}>Orders</li>
        <button className="w-full text-left text-red-700 hover:bg-gray-700" onClick={handleLogout}>Logout</button>
      </ul>
    </div>
  );
};

export default Sidebar;
