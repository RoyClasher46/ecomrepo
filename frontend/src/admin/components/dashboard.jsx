  import React,{ useState,useEffect } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import { ShoppingCart, User } from "lucide-react"; // replace LogIn with User icon

  const Dashboard = ( {setPage,setSelectedProduct }) => {
  
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState(null);
  
    
    useEffect(() => {
      fetch("http://localhost:5000/products")   // or your deployed API URL
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
    }, []);

    useEffect(() => {
      fetch("http://localhost:5000/api/admin/stats")
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => console.error(err));
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
      <div className="min-h-screen">
        {stats && (
          <section className="px-6 md:px-10 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="modern-card p-5 rounded-lg">
                <div className="text-gray-600 text-sm">Total Products</div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalProducts}</div>
              </div>
              <div className="modern-card p-5 rounded-lg">
                <div className="text-gray-600 text-sm">Total Orders</div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalOrders}</div>
              </div>
              <div className="modern-card p-5 rounded-lg">
                <div className="text-gray-600 text-sm">Pending</div>
                <div className="text-3xl font-bold text-gray-900">{stats.statusCounts?.Pending || 0}</div>
              </div>
              <div className="modern-card p-5 rounded-lg">
                <div className="text-gray-600 text-sm">Accepted</div>
                <div className="text-3xl font-bold text-gray-900">{stats.statusCounts?.Accepted || 0}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="modern-card p-5 rounded-lg">
                <div className="text-gray-600 text-sm">Assigned</div>
                <div className="text-2xl font-bold text-gray-900">{stats.statusCounts?.Assigned || 0}</div>
              </div>
              <div className="modern-card p-5 rounded-lg">
                <div className="text-gray-600 text-sm">Rejected</div>
                <div className="text-2xl font-bold text-gray-900">{stats.statusCounts?.Rejected || 0}</div>
              </div>
              <div className="modern-card p-5 rounded-lg">
                <div className="text-gray-600 text-sm">Delivered</div>
                <div className="text-2xl font-bold text-gray-900">{stats.statusCounts?.Delivered || 0}</div>
              </div>
            </div>
          </section>
        )}

        {/* Product Highlights */}
        <section className="px-6 md:px-10 py-8">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-900">
          Listed Products
        </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((item) => (
            <div
            key={item._id}
            className="modern-card rounded-lg overflow-hidden cursor-pointer"
            >
          <img
            src={`data:image/jpeg;base64,${item.image}`}
            alt={item.name}
            className="w-full h-48 object-cover"
            />
          <div className="p-4 text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h4>
            <p className="text-primary font-bold text-xl mb-2">${item.price}</p>
            <p className="text-gray-600 text-sm mb-4">{item.description}</p>
            <button onClick={() =>{setSelectedProduct(item); setPage("manage")}} className="px-4 py-2 modern-button rounded-lg text-sm">
              Manage Product
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>


        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6 mt-16 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} ShopEase. All rights reserved.
        </footer>
      </div>
    );
  };



  export default Dashboard;
