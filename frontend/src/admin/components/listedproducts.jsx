import React, { useState, useEffect } from "react";

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
    <div className="min-h-screen">
      <div className="px-6 md:px-10 pt-6 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Listed Products</h2>
        <p className="text-gray-600">View and manage all your listed products</p>
      </div>

      {products.length === 0 ? (
        <div className="modern-card p-12 rounded-lg text-center mx-6">
          <p className="text-gray-600 text-lg mb-2">No products listed yet.</p>
          <button
            onClick={() => setPage("upload")}
            className="mt-4 px-6 py-3 rounded-lg modern-button text-sm font-semibold"
          >
            Upload Your First Product
          </button>
        </div>
      ) : (
        <section className="px-6 md:px-10 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((item) => (
              <div
                key={item._id}
                className="modern-card rounded-lg overflow-hidden cursor-pointer hover:shadow-medium transition"
                onClick={() => {
                  setSelectedProduct(item);
                  setPage("manage");
                }}
              >
                <div className="w-full h-48 overflow-hidden bg-gray-100">
                  <img
                    src={`data:image/jpeg;base64,${item.image}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{item.name}</h4>
                  <p className="text-primary font-bold text-xl mb-2">₹{item.price}</p>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.isPopular 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {item.isPopular ? "Popular" : "Regular"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.category || "Self"}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(item);
                      setPage("manage");
                    }}
                    className="w-full mt-4 px-4 py-2 modern-button rounded-lg text-sm font-semibold"
                  >
                    Manage Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-16 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} ShopEase. All rights reserved.
      </footer>
    </div>
  );
};

export default ListedProducts;

