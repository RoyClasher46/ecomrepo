import React, { useState, useEffect } from "react";
import { Package, Plus, Edit } from "lucide-react";

const ListedProducts = ({ setPage, setSelectedProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text">Listed Products</h1>
              <p className="text-gray-600 mt-1">View and manage all your listed products</p>
            </div>
          </div>
          <button
            onClick={() => setPage("upload")}
            className="px-6 py-3 rounded-xl modern-button font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Upload Product
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="modern-card rounded-2xl p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-700 text-lg font-semibold mb-2">No products listed yet.</p>
          <p className="text-gray-500 text-sm mb-6">Get started by uploading your first product</p>
          <button
            onClick={() => setPage("upload")}
            className="px-8 py-4 rounded-xl modern-button text-base font-semibold flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Upload Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((item) => (
            <div
              key={item._id}
              className="group modern-card rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300"
              onClick={() => {
                setSelectedProduct(item);
                setPage("manage");
              }}
            >
              <div className="relative w-full h-56 overflow-hidden bg-gray-100">
                <img
                  src={`data:image/jpeg;base64,${item.image}`}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg ${
                    item.isPopular 
                      ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white" 
                      : "bg-white/90 text-gray-700"
                  }`}>
                    {item.isPopular ? "⭐ Popular" : "Regular"}
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <h4 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                <p className="text-2xl font-bold gradient-text">₹{item.price}</p>
                <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200">
                    {item.category || "Self"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(item);
                      setPage("manage");
                    }}
                    className="px-4 py-2 rounded-xl modern-button text-sm font-semibold flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListedProducts;

