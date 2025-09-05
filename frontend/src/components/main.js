import React, { useState,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react"; // replace LogIn with User icon



export default function Main() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
    fetch("http://localhost:5000/products")   // or your deployed API URL
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
}, []);

    const [showDropdown, setShowDropdown] = useState(false);
    
    const navigate = useNavigate();

  const handleUserClick = () => {
    setShowDropdown(!showDropdown);
  };
  //order pending
  const handleOrder = async(productId) => {
    console.log("Incoming Order Request:", productId);

    const res = await fetch("http://localhost:5000/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
        credentials: "include" 
        });
        const data = await res.json();
      if (res.ok) {
         alert("Order placed successfully!");
         navigate("/myorders");
      } else {
        alert(data.message || "Something went wrong");
      }
    
  };


  const handleLogout = async() => {
    const res= await fetch("http://localhost:5000/api/logout", {
      method: "GET",
      credentials: "include"
    });
    const data = await res.json();
    if (res.ok) {
         alert("logout successfully!");
         navigate("/"); // redirect to login page
      }
}

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-5 bg-white shadow-md relative">
        <h1 className="text-2xl font-bold text-indigo-600">ShopEase</h1>
        <div className="flex items-center gap-6 relative">
          <Link to="/" className="text-gray-700 hover:text-indigo-600">Home</Link>
          <Link to="/products" className="text-gray-700 hover:text-indigo-600">Products</Link>
          <Link to="/about" className="text-gray-700 hover:text-indigo-600">About</Link>

          {/* User Icon with dropdown */}
          <div className="relative">
            <User
              className="w-6 h-6 text-gray-700 hover:text-indigo-600 cursor-pointer"
              onClick={handleUserClick}
            />
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-10">
                <button
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                  onClick={() => navigate("/myorders")}
                  >
                  MyOrders
                </button>
                
                <button
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Logout
                </button>
                </div>
            )}
          </div>

          <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-indigo-600 cursor-pointer" />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-20 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <h2 className="text-5xl font-extrabold mb-4 animate-bounce">Welcome to ShopEase</h2>
        <p className="max-w-xl mb-6 text-lg">
          Discover the best deals on fashion, electronics, and home essentials.
        </p>
        <Link
          to="/products"
          className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl shadow-md hover:bg-gray-100 transition"
        >
          Shop Now
        </Link>
      </section>

      {/* Product Highlights */}
       <section className="px-10 py-16">
       <h3 className="text-3xl font-bold text-center mb-10 text-gray-800">
          Featured Products
       </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((item) => (
        <div
          key={item._id}   // MongoDB id
          className="bg-white rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform"
        >
        <img
          //src="data:image/jpeg;base64,{item.image.data.toString('base64')}"   // or item.img depending on your DB field
          src={`data:image/jpeg;base64,${item.image}`}
          alt={item.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4 text-center">
          <h4 className="text-lg font-semibold">{item.name}</h4>
          <p className="text-indigo-600 font-bold">${item.price}</p>
          <div>
  <button
    className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
    onClick={() => handleOrder(item._id)}
  >
    Place Order
  </button>
</div>

        </div>
      </div>
    ))}
  </div>
</section>


      {/* Footer */}
      <footer className="bg-white py-6 mt-16 shadow-inner text-center text-gray-600">
        © {new Date().getFullYear()} ShopEase. All rights reserved.
      </footer>
    </div>
  );
}
