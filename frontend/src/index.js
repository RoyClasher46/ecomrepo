import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./components/home";
import Login from "./components/login";
import Signup from "./components/signup";
import Main from "./components/main";
import ProtectedRoute from "./components/protectedroute";
import AdminLogin from "./components/adminlogin";
import AdminMain from "./admin/components/adminmain";
import Dashboard from "./admin/components/dashboard";
import MyOrders from "./components/myorder";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/adminmain" element={<ProtectedRoute><AdminMain /></ProtectedRoute>}  />
      <Route path="/home" element={<ProtectedRoute><Main /></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/adminlogin" element={<AdminLogin />} />
      {/* <Route path="/admindashboard" element={<Dashboard />} /> */}
      <Route path="/myorders" element={<MyOrders />} />
    </Routes>
  </Router>
);
