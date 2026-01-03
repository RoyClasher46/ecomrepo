import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const UploadProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "Self",
    image: null,
    images: [],
  });  
  const [preview, setPreview] = useState(null);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);
  const [sizes, setSizes] = useState([
    { size: "S", available: true },
    { size: "M", available: true },
    { size: "L", available: true },
    { size: "XL", available: true },
  ]);

  const handleChange = (e) =>
    setProduct({ ...product, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProduct({ ...product, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setProduct({ ...product, images: files });
      setAdditionalPreviews(files.map(file => URL.createObjectURL(file)));
    }
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...sizes];
    if (field === 'size') {
      updatedSizes[index].size = value;
    } else if (field === 'available') {
      updatedSizes[index].available = value;
    }
    setSizes(updatedSizes);
  };

  const addSize = () => {
    setSizes([...sizes, { size: "", available: true }]);
  };

  const removeSize = (index) => {
    setSizes(sizes.filter((_, i) => i !== index));
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
        
        // Append additional images
        product.images.forEach((file) => {
          formData.append("images", file);
        });
        
        // Append sizes as JSON
        formData.append("sizes", JSON.stringify(sizes.filter(s => s.size.trim() !== "")));

    const res = await fetch("/api/uploadproduct", {
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
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-lg modern-card rounded-lg p-8 shadow-large">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
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
              className="modern-input"
              placeholder="Enter product name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/90 font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              required
              rows="4"
              className="modern-input min-h-[100px]"
              placeholder="Enter product description"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-white/90 font-medium mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              required
              className="modern-input"
              placeholder="Enter product price"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-white/90 font-medium mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={product.category}
              onChange={handleChange}
              required
              className="modern-input"
              placeholder="Enter or create category (e.g., Electronics, Fashion)"
            />
            <p className="text-xs text-gray-500 mt-1">If new, it will be created automatically.</p>
          </div>

          {/* Main Image Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Main Product Image <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
              file:rounded-lg file:border-0 file:text-sm file:font-semibold 
              file:bg-primary file:text-white 
              hover:file:bg-primary-dark cursor-pointer"
            />
            {preview && (
              <div className="mt-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-medium"
                />
              </div>
            )}
          </div>

          {/* Additional Images Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Additional Product Images (Optional)
            </label>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={handleAdditionalImagesChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
              file:rounded-lg file:border-0 file:text-sm file:font-semibold 
              file:bg-primary file:text-white 
              hover:file:bg-primary-dark cursor-pointer"
            />
            {additionalPreviews.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {additionalPreviews.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-medium"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sizes Management */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Product Sizes
            </label>
            <div className="space-y-2">
              {sizes.map((sizeItem, index) => (
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
                  {sizes.length > 1 && (
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
            <p className="text-xs text-gray-500 mt-1">
              Add sizes for your product. Uncheck "Available" if a size is currently out of stock.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 modern-button font-semibold rounded-lg"
          >
            Upload Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadProduct;
