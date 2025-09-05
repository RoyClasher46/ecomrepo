import React, { useEffect, useState } from "react";

const ManageProducts = ( {selectedProduct} ) => {
  const [products, setProducts] = useState([]);
  const [highlightedId, setHighlightedId] = useState(selectedProduct ? selectedProduct._id : null);

  // For editing
  const [editingProduct, setEditingProduct] = useState(null); // product currently being edited
  const [formData, setFormData] = useState({ name: "", price: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch products from backend
  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

   useEffect(() => {
    if (selectedProduct) {
      setHighlightedId(selectedProduct._id);
      const timer = setTimeout(() => setHighlightedId(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [selectedProduct]);

  // Highlight new product if needed
  useEffect(() => {
    if (editingProduct) {
      setHighlightedId(editingProduct._id);
      const timer = setTimeout(() => {
        setHighlightedId(null);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [editingProduct]);

  // Delete Product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`http://localhost:5000/products/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setProducts((prev) => prev.filter((product) => product._id !== id));
        alert(data.message);
      } else {
        alert(data.message || "Failed to delete product");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting product");
    }
  };

  // Open Edit Modal
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({ name: product.name, price: product.price });
    setIsModalOpen(true);
  };

  // Save Product Changes
  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:5000/products/${editingProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Update in state
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? { ...p, ...formData } : p))
        );
        alert("Product updated successfully!");
        setIsModalOpen(false);
        setEditingProduct(null);
      } else {
        alert(data.message || "Failed to update product");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating product");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Products</h2>

      {products.length === 0 ? (
        <p className="text-gray-500">No products listed yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Price</th>
                <th className="py-2 px-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr
                  key={product._id}
                  className={`${
                    highlightedId === product._id
                      ? "bg-yellow-100 animate-pulse"
                      : index % 2 === 0
                      ? "bg-white"
                      : "bg-gray-50"
                  }`}
                >
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4">{product.name}</td>
                  <td className="py-2 px-4 text-indigo-600 font-semibold">
                    ${product.price}
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleEdit(product)}
                      className="mr-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Product</h3>
            
            <label className="block mb-2 font-medium">Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            />

            <label className="block mb-2 font-medium">Price:</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
