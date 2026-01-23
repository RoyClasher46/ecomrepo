import React, { useEffect, useState, useMemo } from "react";
import { Settings, Search, Filter, Edit, Trash2, Star, Package } from "lucide-react";
import { getImageSrc } from "../../utils/imageUtils";

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
        {
          method: "DELETE",
          credentials: "include"
        }
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
        credentials: "include",
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
          credentials: "include",
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
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary dark:bg-accent flex items-center justify-center shadow-lg flex-shrink-0">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">Manage Products</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">View, edit, and manage all your products</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="modern-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-primary dark:text-accent" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Filters & Search</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Products
            </label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none"
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
        <div className="modern-card rounded-2xl p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold mb-2">No products found.</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Try adjusting your filters or add new products.</p>
        </div>
      ) : (
        <>
          <div className="modern-card rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle sm:px-0">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 sm:py-4 px-2 sm:px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Image</th>
                      <th className="py-3 sm:py-4 px-2 sm:px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="py-3 sm:py-4 px-2 sm:px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Category</th>
                      <th className="py-3 sm:py-4 px-2 sm:px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Price</th>
                      <th className="py-3 sm:py-4 px-2 sm:px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Popular</th>
                      <th className="py-3 sm:py-4 px-2 sm:px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentItems.map((product, index) => (
                      <tr
                        key={product._id}
                        className={
                          highlightedId === product._id
                            ? "bg-gray-100 dark:bg-gray-800 border-l-4 border-primary dark:border-accent"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        }
                      >
                        <td className="py-3 sm:py-4 px-2 sm:px-4">
                          <img
                            src={getImageSrc(product.image)}
                            alt={product.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-md"
                          />
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 min-w-[150px]">
                          <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">{product.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 max-w-xs hidden sm:block">{product.description}</div>
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">
                          <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-primary dark:text-accent rounded-lg border border-gray-200 dark:border-gray-700">
                            {normalizeCategory(product.category)}
                          </span>
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4">
                          <span className="text-base sm:text-lg font-bold gradient-text">₹{product.price}</span>
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 hidden md:table-cell">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={product.isPopular}
                              onChange={(e) => togglePopular(product._id, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary dark:peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-primary dark:peer-checked:bg-accent"></div>
                            {product.isPopular && (
                              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400 ml-1 sm:ml-2" />
                            )}
                          </label>
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4">
                          <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 modern-button text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all font-semibold flex items-center justify-center gap-1 sm:gap-1.5 shadow-md hover:shadow-lg"
                            >
                              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all font-semibold flex items-center justify-center gap-1 sm:gap-1.5 shadow-md hover:shadow-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
                Showing {indexOfFirst + 1} to {Math.min(indexOfLast, displayedProducts.length)} of {displayedProducts.length} products
              </div>
              <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg modern-button-secondary text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
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
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${currentPage === pageNum
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
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg modern-button-secondary text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="modern-card p-4 sm:p-6 rounded-lg shadow-large w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Edit Product</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl sm:text-2xl p-1"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Images Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Product Images</h4>

                {/* Main Image */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Main Product Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    {newImagePreview ? (
                      <img
                        src={newImagePreview}
                        alt="New preview"
                        className="max-w-full max-h-48 object-contain rounded-lg mx-auto"
                      />
                    ) : editingProduct.image ? (
                      <img
                        src={getImageSrc(editingProduct.image)}
                        alt="Current product"
                        className="max-w-full max-h-48 object-contain rounded-lg mx-auto"
                      />
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500 text-sm text-center">No image available</div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="mt-2 w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 
                    file:rounded-lg file:border-0 file:text-sm file:font-semibold 
                    file:bg-primary file:text-white 
                    hover:file:bg-primary-dark cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upload a new image to replace the current one</p>
                </div>

                {/* Additional Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Product Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesChange}
                    className="w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 
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
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add more images to showcase the product (optional)</p>
                </div>
              </div>

              {/* Product Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Product Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹) *</label>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
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
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mark as Popular</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sizes Management */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Product Sizes</h4>
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
                      <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
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
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium"
                >
                  + Add Size
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Manage product sizes. Uncheck "Available" to mark a size as out of stock.
              </p>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
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
