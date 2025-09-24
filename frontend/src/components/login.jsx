// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
        alert("Login successfully!");
        navigate("/home");
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 rounded-2xl shadow-2xl w-96 border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">
          Login
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-400 transition duration-200"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-400 transition duration-200"
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-2 rounded-xl hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 transition duration-300 shadow-lg hover:shadow-pink-500/40"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-indigo-400 font-semibold hover:underline hover:text-pink-400 transition"
          >
            Register
          </Link>
        </p>
        <p className="mt-2 text-center text-gray-400">
          Are you an admin?{" "}
          <Link
            to="/adminlogin"
            className="text-red-500 font-semibold hover:underline hover:text-red-400 transition"
          >
            Admin Login
          </Link>
        </p>
      </div>
    </div>
  );
}
