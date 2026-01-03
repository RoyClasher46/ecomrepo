import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import HomeWrapper from "./components/homewrapper";
import Login from "./components/login";
import Signup from "./components/signup";
import ForgotPassword from "./components/forgotpassword";
import Main from "./components/main";
import ProtectedRoute from "./components/protectedroute";
import AdminLogin from "./components/adminlogin";
import AdminMain from "./admin/components/adminmain";
import Dashboard from "./admin/components/dashboard";
import MyOrders from "./components/myorder";
import UserCart from "./components/usercart";
import ProductPage from "./components/selectedprod";
import CategoryPage from "./components/category";
import About from "./components/about";
import Contact from "./components/Contact";
import Checkout from "./components/checkout";
import ReturnOrder from "./components/returnorder";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
      <ToastContainer position="top-right" autoClose={3000} />
    <Routes>
      <Route path="/" element={<HomeWrapper />} />
      <Route path="/adminmain" element={<ProtectedRoute><AdminMain /></ProtectedRoute>}  />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/adminlogin" element={<AdminLogin />} />
      {/* <Route path="/admindashboard" element={<Dashboard />} /> */}
      <Route path="/myorders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
      <Route path="/return-order/:orderId" element={<ProtectedRoute><ReturnOrder /></ProtectedRoute>} />
      <Route path="/usercart" element={<ProtectedRoute><UserCart /></ProtectedRoute>} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/category/:name" element={<CategoryPage />} />
      
    </Routes>
  </Router>
);
