// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate} from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({
      email: "",
      password: "",
    });
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const navigate = useNavigate();
  
  const handleSubmit = async(e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include"
      });

      const data = await res.json();
      if (res.ok) {
         alert("login successfully!");
         navigate("/home"); // redirect to login page
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
    }


  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-indigo-200">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Login</h2>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-700 font-semibold hover:underline">
            Register
          </Link>
        </p>
        <p className="mt-2 text-center text-gray-600">
          Are you an admin?{" "}
          <Link to="/adminlogin" className="text-red-600 font-semibold hover:underline">
              Admin Login
          </Link>
      </p>
      </div>
    </div>
  );
}
