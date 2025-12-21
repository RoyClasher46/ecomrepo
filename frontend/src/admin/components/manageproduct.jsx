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
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Manage Products
      </h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          Search Box:<input
            type="text"
            placeholder="Search name or description..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border rounded w-64"
          />
        </div>

        <div className="flex items-center gap-3">
          <label>Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border rounded"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All" : c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label>Sort:</label>
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border rounded"
          >
            <option value="none">None</option>
            <option value="price_low">Price Low → High</option>
            <option value="price_high">Price High → Low</option>
            <option value="new">Newest First</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      {currentItems.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <>
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">Category</th>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Price</th>
                <th className="py-2 px-4 text-left">Description</th>
                <th className="py-2 px-4 text-left">Popular</th>
                <th className="py-2 px-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((product, index) => (
                <tr
                  key={product._id}
                  className={
                    highlightedId === product._id
                      ? "bg-yellow-100 animate-pulse"
                      : index % 2 === 0
                      ? "bg-white"
                      : "bg-gray-50"
                  }
                >
                  <td className="py-2 px-4">{indexOfFirst + index + 1}</td>
                  <td className="py-2 px-4">{normalizeCategory(product.category)}</td>
                  <td className="py-2 px-4">{product.name}</td>
                  <td className="py-2 px-4">${product.price}</td>
                  <td className="py-2 px-4">{product.description}</td>

                  <td className="py-2 px-4">
                    <input
                      className="w-5 h-5 cursor-pointer" 
                      type="checkbox"
                      checked={product.isPopular}
                      onChange={(e) =>
                        togglePopular(product._id, e.target.checked)
                      }
                    />
                  </td>

                  <td className="py-2 px-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(product._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-6 flex justify-center gap-3">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Edit Product</h3>

            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              className="w-full p-2 border rounded mb-3"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <label>Price</label>
            <input
              type="number"
              value={formData.price}
              className="w-full p-2 border rounded mb-3"
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />

            <label>Description</label>
            <input
              type="text"
              value={formData.description}
              className="w-full p-2 border rounded mb-3"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
            />

            <label>Category</label>
            <input
              type="text"
              value={formData.category}
              className="w-full p-2 border rounded mb-4"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value,
                })
              }
            />

            <button
              className="px-4 py-2 bg-blue-600 text-white rounded mr-2"
              onClick={handleSave}
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
