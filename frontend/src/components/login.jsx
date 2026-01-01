// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Login successfully!");
        navigate("/home");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="modern-card p-8 rounded-lg shadow-large w-full max-w-md">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-900">
          Login
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="modern-input"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="modern-input"
            required
          />
          <button
            type="submit"
            className="w-full modern-button py-3 rounded-lg"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-primary font-semibold hover:text-primary-dark transition underline"
          >
            Register
          </Link>
        </p>
        <p className="mt-2 text-center text-gray-600 text-sm">
          Are you an admin?{" "}
          <Link
            to="/adminlogin"
            className="text-primary font-semibold hover:text-primary-dark transition underline"
          >
            Admin Login
          </Link>
        </p>
      </div>
    </div>
  );
}
