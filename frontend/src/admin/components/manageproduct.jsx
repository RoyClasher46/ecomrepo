import React, { useEffect, useState, useMemo } from "react";

const ManageProducts = ({ selectedProduct }) => {
  const [products, setProducts] = useState([]);
  const [highlightedId, setHighlightedId] = useState(
    selectedProduct ? selectedProduct._id : null
  );
  const [saving, setSaving] = useState(false);
  const [sortOption, setSortOption] = useState("none");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    isPopular: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search bar state
  const [searchText, setSearchText] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch products
  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  // Unique categories
  const normalizeCategory = (c) => {
    if (!c) return "Self";
    const t = String(c).trim();
    if (t.length === 0) return "Self";
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  };

  const categories = useMemo(() => {
    const setA = new Set();
    products.forEach((p) => {
      setA.add(normalizeCategory(p.category));
    });
    return ["all", ...Array.from(setA)];
  }, [products]);

  // 🔥 MASTER FILTER SYSTEM (Search + Category + Sorting)
  const displayedProducts = useMemo(() => {
    let list = [...products];

    // SEARCH
    if (searchText.trim() !== "") {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(searchText.toLowerCase()) ||
          p.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // CATEGORY FILTER
    if (categoryFilter !== "all") {
      list = list.filter(
        (p) =>
          (p.category || "Self").toLowerCase() ===
          categoryFilter.toLowerCase()
      );
    }

    // SORTING
    switch (sortOption) {
      case "price_low":
        list.sort(
          (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0)
        );
        break;
      case "price_high":
        list.sort(
          (a, b) => (Number(b.price) || 0) - (Number(a.price) || 0)
        );
        break;
      case "new":
        list.sort(
          (a, b) =>
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
      default:
        break;
    }

    return list;
  }, [products, searchText, categoryFilter, sortOption]);

  // PAGINATION
  const totalPages = Math.ceil(displayedProducts.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = displayedProducts.slice(indexOfFirst, indexOfLast);

  // Highlight new product
  useEffect(() => {
    if (selectedProduct) {
      setHighlightedId(selectedProduct._id);
      const t = setTimeout(() => setHighlightedId(null), 2500);
      return () => clearTimeout(t);
    }
  }, [selectedProduct]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/products/${id}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (!res.ok) return alert(data.message);
      setProducts((prev) => prev.filter((p) => p._id !== id));

      alert("Deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Error deleting item");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      category: normalizeCategory(product.category),
      isPopular: product.isPopular,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = { ...formData, category: normalizeCategory(formData.category) };

      const res = await fetch(`http://localhost:5000/products/${editingProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) return alert("Update failed");

      // Update local UI
      setProducts((prev) =>
        prev.map((p) =>
          p._id === editingProduct._id ? { ...p, ...payload } : p
        )
      );

      alert("Updated successfully!");
      setIsModalOpen(false);
    } catch (err) {
      alert("Error updating item");
    } finally {
      setSaving(false);
    }
  };

  const togglePopular = async (id, next) => {
    try {
      const res = await fetch(
        `http://localhost:5000/products/${id}/popular`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPopular: next }),
        }
      );

      if (!res.ok) throw new Error("Failed");

      setProducts((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, isPopular: next } : p
        )
      );
    } catch (err) {
      alert("Failed to update popular status");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
          Manage Products
        </h2>
        <p className="text-gray-600">View, edit, and manage all your products</p>
      </div>

      {/* Filters */}
      <div className="modern-card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search products..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              className="modern-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="modern-input w-full"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className="modern-input w-full"
            >
              <option value="none">Default</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="new">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Table */}
      {currentItems.length === 0 ? (
        <div className="modern-card p-12 rounded-lg text-center">
          <p className="text-gray-600 text-lg">No products found.</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or add new products.</p>
        </div>
      ) : (
        <>
          <div className="modern-card rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Image</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Category</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Price</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Popular</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((product, index) => (
                    <tr
                      key={product._id}
                      className={
                        highlightedId === product._id
                          ? "bg-blue-50 border-l-4 border-primary"
                          : "hover:bg-gray-50"
                      }
                    >
                      <td className="py-3 px-4">
                        <img
                          src={`data:image/jpeg;base64,${product.image}`}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-xs">{product.description}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          {normalizeCategory(product.category)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-bold text-primary">${product.price}</span>
                      </td>
                      <td className="py-3 px-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={product.isPopular}
                            onChange={(e) => togglePopular(product._id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg transition font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="px-3 py-1.5 bg-error hover:bg-error-dark text-white text-sm rounded-lg transition font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirst + 1} to {Math.min(indexOfLast, displayedProducts.length)} of {displayedProducts.length} products
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg modern-button-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        currentPage === pageNum
                          ? "modern-button"
                          : "modern-button-secondary"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg modern-button-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modern-card p-6 rounded-lg shadow-large w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Product</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Image Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
                  {editingProduct.image ? (
                    <img
                      src={`data:image/jpeg;base64,${editingProduct.image}`}
                      alt="Product preview"
                      className="max-w-full max-h-64 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-gray-400 text-sm">No image available</div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">Note: Image cannot be changed here. Upload a new product to change the image.</p>
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    className="modern-input"
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    className="modern-input"
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    value={formData.category}
                    className="modern-input"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value,
                      })
                    }
                    placeholder="e.g., Electronics, Fashion"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    className="modern-input min-h-[100px] resize-none"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) =>
                      setFormData({ ...formData, isPopular: e.target.checked })
                    }
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label className="text-sm font-medium text-gray-700">Mark as Popular</label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                className="flex-1 modern-button py-2.5 rounded-lg"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                className="flex-1 modern-button-secondary py-2.5 rounded-lg"
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
