import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./index.css";
// Import API config to initialize fetch override in production
import "./config/api";
import HomeWrapper from "./components/homewrapper";
import Login from "./components/login";
import Signup from "./components/signup";
import ForgotPassword from "./components/forgotpassword";
import ProtectedRoute from "./components/protectedroute";
import AdminProtectedRoute from "./components/adminProtectedRoute";
import UserRoute from "./components/userRoute";
import AdminMain from "./admin/components/adminmain";
import MyOrders from "./components/myorder";
import UserCart from "./components/usercart";
import ProductPage from "./components/selectedprod";
import CategoryPage from "./components/category";
import About from "./components/about";
import Contact from "./components/Contact";
import Checkout from "./components/checkout";
import ReturnOrder from "./components/returnorder";
import Profile from "./components/profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider>
    <Router>
        <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
      <Route path="/" element={<UserRoute><HomeWrapper /></UserRoute>} />
      <Route path="/adminmain" element={<AdminProtectedRoute><AdminMain /></AdminProtectedRoute>}  />
      <Route path="/about" element={<UserRoute><About /></UserRoute>} />
      <Route path="/contact" element={<UserRoute><Contact /></UserRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/login" element={<UserRoute><Login /></UserRoute>} />
      <Route path="/signup" element={<UserRoute><Signup /></UserRoute>} />
      <Route path="/forgot-password" element={<UserRoute><ForgotPassword /></UserRoute>} />
      {/* <Route path="/admindashboard" element={<Dashboard />} /> */}
      <Route path="/myorders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/return-order/:orderId" element={<ProtectedRoute><ReturnOrder /></ProtectedRoute>} />
      <Route path="/usercart" element={<ProtectedRoute><UserCart /></ProtectedRoute>} />
      <Route path="/product/:id" element={<UserRoute><ProductPage /></UserRoute>} />
      <Route path="/category/:name" element={<UserRoute><CategoryPage /></UserRoute>} />
      
      </Routes>
    </Router>
  </ThemeProvider>
);
