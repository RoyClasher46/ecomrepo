import React, { useState, useEffect } from "react";
import { Upload, Image, DollarSign, Tag, Package, Save, Plus, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UploadProduct = ({ setPage }) => {
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
  const [categories, setCategories] = useState([]);
  const [isNewCategory, setIsNewCategory] = useState(false);

  // Fetch existing categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

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
        toast.success("Product uploaded successfully!");
        // Reset form
        setProduct({
          name: "",
          description: "",
          price: "",
          category: "Self",
          image: null,
          images: [],
        });
        setPreview(null);
        setAdditionalPreviews([]);
        setSizes([
          { size: "S", available: true },
          { size: "M", available: true },
          { size: "L", available: true },
          { size: "XL", available: true },
        ]);
        setIsNewCategory(false);
        // Redirect to listed products page
        if (setPage) {
          setPage("listed");
        }
      } else {
        toast.error("Failed to upload product");
      }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary dark:bg-accent flex items-center justify-center shadow-lg flex-shrink-0">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">Upload Product</h1>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mt-1">Add a new product to your store</p>
          </div>
        </div>
      </div>

      <div className="modern-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none"
              placeholder="Enter product name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none resize-none"
              placeholder="Enter product description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                required
                className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none"
                placeholder="Enter product price"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Category
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewCategory(false);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      !isNewCategory
                        ? "bg-primary dark:bg-accent text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Select Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewCategory(true);
                      setProduct({ ...product, category: "" });
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1 ${
                      isNewCategory
                        ? "bg-primary dark:bg-accent text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Create New
                  </button>
                </div>
                
                {!isNewCategory ? (
                  <div className="relative">
                    <select
                      name="category"
                      value={product.category}
                      onChange={(e) => setProduct({ ...product, category: e.target.value })}
                      required
                      className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="Self">Select a category...</option>
                      {categories.map((cat, index) => (
                        <option key={index} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                ) : (
                  <input
                    type="text"
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none"
                    placeholder="Enter new category name (e.g., Electronics, Fashion)"
                  />
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {!isNewCategory 
                  ? "Select from existing categories or create a new one."
                  : "New category will be created automatically when product is uploaded."}
              </p>
            </div>
          </div>

          {/* Main Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Main Product Image <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-primary dark:hover:border-accent transition-colors">
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 
                file:rounded-lg file:border-0 file:text-sm file:font-semibold 
                file:bg-primary file:dark:bg-accent file:text-white 
                hover:file:bg-primary-dark hover:file:dark:bg-accent-dark cursor-pointer"
              />
              {preview && (
                <div className="mt-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-xl border-2 border-gray-200 shadow-lg mx-auto"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Additional Images Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Additional Product Images (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-primary dark:hover:border-accent transition-colors">
              <input
                type="file"
                name="images"
                accept="image/*"
                multiple
                onChange={handleAdditionalImagesChange}
                className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 
                file:rounded-lg file:border-0 file:text-sm file:font-semibold 
                file:bg-primary file:dark:bg-accent file:text-white 
                hover:file:bg-primary-dark hover:file:dark:bg-accent-dark cursor-pointer"
              />
              {additionalPreviews.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3 justify-center">
                  {additionalPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200 shadow-md"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sizes Management */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Product Sizes
            </label>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-800/70">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Size</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Available</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sizes.map((sizeItem, index) => (
                      <tr key={index} className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={sizeItem.size}
                            onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                            placeholder="Size (e.g., S, M, L, XL)"
                            className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={sizeItem.available}
                                onChange={(e) => handleSizeChange(index, 'available', e.target.checked)}
                                className="w-4 h-4 text-primary dark:text-accent rounded focus:ring-primary dark:focus:ring-accent"
                              />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {sizeItem.available ? "Yes" : "No"}
                              </span>
                            </label>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            {sizes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSize(index)}
                                className="px-3 py-1.5 bg-error hover:bg-error-dark text-white rounded-lg text-xs sm:text-sm font-semibold transition-all"
                              >
                                Remove
                              </button>
                            )}
                            {sizes.length === 1 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">Required</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={addSize}
                  className="w-full px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-semibold transition-all border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                >
                  + Add Size
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Add sizes for your product. Uncheck "Available" if a size is currently out of stock.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 modern-button font-semibold rounded-xl text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Save className="w-5 h-5" />
            Upload Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadProduct;
