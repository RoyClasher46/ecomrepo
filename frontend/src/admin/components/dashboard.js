  import React,{ useState,useEffect } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import { ShoppingCart, User } from "lucide-react"; // replace LogIn with User icon

  const Dashboard = ( {setPage,setSelectedProduct }) => {
  
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
        {/* Product Highlights */}
        <section className="px-10 py-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800">
          Listed Products
        </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((item) => (
            <div
            key={item._id}   // MongoDB id
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform"
            >
          <img
            src={`data:image/jpeg;base64,${item.image}`}
            alt={item.name}
            className="w-full h-48 object-cover"
            />
          <div className="p-4 text-center">
            <h4 className="text-lg font-semibold">{item.name}</h4>
            <p className="text-indigo-600 font-bold">${item.price}</p>
            <button onClick={() =>{setSelectedProduct(item); setPage("manage")}} className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Edit Product
            </button>
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
  };



  export default Dashboard;
