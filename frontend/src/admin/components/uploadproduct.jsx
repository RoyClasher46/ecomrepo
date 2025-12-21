import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const UploadProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "Self",
    image: null,
  });  
  const [preview, setPreview] = useState(null);

  const handleChange = (e) =>
    setProduct({ ...product, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProduct({ ...product, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    // Normalize category: first letter capital, rest lowercase
    const normalizeCategory = (c) => {
      if (!c) return "Self";
      const t = c.trim();
      if (t.length === 0) return "Self";
      return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    };

    const normalizedCategory = normalizeCategory(product.category);
    // Update UI with normalized value before submitting
    setProduct((prev) => ({ ...prev, category: normalizedCategory }));

    const formData = new FormData();
        formData.append("name", product.name);
        formData.append("description", product.description);
        formData.append("price", product.price);
        formData.append("category", normalizedCategory || "Self");
        formData.append("image", product.image);

    const res = await fetch("http://localhost:5000/api/uploadproduct", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      if (res.ok) {
        alert("Product uploaded successfully!");
        window.location.reload();
      }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Upload Product
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition duration-200"
              placeholder="Enter product name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition duration-200"
              placeholder="Enter product description"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition duration-200"
              placeholder="Enter product price"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={product.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition duration-200"
              placeholder="Enter or create category (e.g., Eco dishes, Gift sets)"
            />
            <p className="text-xs text-gray-500 mt-1">If new, it will be created automatically.</p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Product Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
              file:rounded-lg file:border-0 file:text-sm file:font-semibold 
              file:bg-indigo-50 file:text-indigo-600 
              hover:file:bg-indigo-100 cursor-pointer"
            />
            {preview && (
              <div className="mt-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border shadow-md"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
          >
            Upload Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadProduct;
