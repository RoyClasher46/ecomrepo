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
    sizes: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);

  // Search bar state
  const [searchText, setSearchText] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch products
  useEffect(() => {
    fetch("/products")
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
        `/products/${id}`,
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
      sizes: product.sizes || [],
    });
    setNewImage(null);
    setNewImagePreview(null);
    setAdditionalImages([]);
    setAdditionalImagePreviews([]);
    setIsModalOpen(true);
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...formData.sizes];
    if (field === 'size') {
      updatedSizes[index].size = value;
    } else if (field === 'available') {
      updatedSizes[index].available = value;
    }
    setFormData({ ...formData, sizes: updatedSizes });
  };

  const addSize = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { size: "", available: true }],
    });
  };

  const removeSize = (index) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((_, i) => i !== index),
    });
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setNewImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setAdditionalImages(files);
      setAdditionalImagePreviews(files.map(file => URL.createObjectURL(file)));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", normalizeCategory(formData.category));
      formDataToSend.append("isPopular", formData.isPopular);
      formDataToSend.append("sizes", JSON.stringify(formData.sizes.filter(s => s.size.trim() !== "")));

      // Add new main image if provided
      if (newImage) {
        formDataToSend.append("image", newImage);
      }

      // Add additional images if provided
      additionalImages.forEach((file) => {
        formDataToSend.append("images", file);
      });

      const res = await fetch(`/products/${editingProduct._id}`, {
        method: "PUT",
        body: formDataToSend,
      });

      if (!res.ok) {
        const data = await res.json();
        return alert(data.message || "Update failed");
      }

      // Refresh products list
      const productsRes = await fetch("/products");
      const updatedProducts = await productsRes.json();
      setProducts(updatedProducts);

      alert("Updated successfully!");
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error updating item");
    } finally {
      setSaving(false);
    }
  };

  const togglePopular = async (id, next) => {
    try {
      const res = await fetch(
        `/products/${id}/popular`,
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
                        <span className="text-sm font-bold text-primary">₹{product.price}</span>
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

            <div className="space-y-6">
              {/* Images Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h4>
                
                {/* Main Image */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Product Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {newImagePreview ? (
                      <img
                        src={newImagePreview}
                        alt="New preview"
                        className="max-w-full max-h-48 object-contain rounded-lg mx-auto"
                      />
                    ) : editingProduct.image ? (
                      <img
                        src={`data:image/jpeg;base64,${editingProduct.image}`}
                        alt="Current product"
                        className="max-w-full max-h-48 object-contain rounded-lg mx-auto"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm text-center">No image available</div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="mt-2 w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
                    file:rounded-lg file:border-0 file:text-sm file:font-semibold 
                    file:bg-primary file:text-white 
                    hover:file:bg-primary-dark cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload a new image to replace the current one</p>
                </div>

                {/* Additional Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Product Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesChange}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
                    file:rounded-lg file:border-0 file:text-sm file:font-semibold 
                    file:bg-primary file:text-white 
                    hover:file:bg-primary-dark cursor-pointer"
                  />
                  {additionalImagePreviews.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {additionalImagePreviews.map((preview, index) => (
                        <img
                          key={index}
                          src={preview}
                          alt={`Additional ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Add more images to showcase the product (optional)</p>
                </div>
              </div>

              {/* Product Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h4>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
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
            </div>

            {/* Sizes Management */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Sizes</h4>
              <div className="space-y-3">
                {formData.sizes.map((sizeItem, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={sizeItem.size}
                      onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                      placeholder="Size (e.g., S, M, L, XL, 10, 11)"
                      className="flex-1 modern-input"
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sizeItem.available}
                        onChange={(e) => handleSizeChange(index, 'available', e.target.checked)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm text-gray-700">Available</span>
                    </label>
                    {formData.sizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSize}
                  className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium"
                >
                  + Add Size
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Manage product sizes. Uncheck "Available" to mark a size as out of stock.
              </p>
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
