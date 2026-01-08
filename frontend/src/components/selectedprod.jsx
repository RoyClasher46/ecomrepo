// src/pages/ProductPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "./navbar";
import Footer from "./Footer";
import FloatingCart from "./FloatingCart";
import { toast } from "react-toastify";
import { StarRatingDisplay, StarRatingInput } from "./StarRating";
import { getImageSrc } from "../utils/imageUtils";

export default function ProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [newReview, setNewReview] = useState({ 
    user: "", 
    rating: 0, 
    comment: "",
    reviewImages: []
  });
  const [reviewImageFiles, setReviewImageFiles] = useState([]);

  // Scroll to top when component mounts or product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    
    // Get current user from localStorage once when component mounts
    const currentUser = JSON.parse(localStorage.getItem("user")) || null;
    
    // Fetch product data
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        setProduct(data);
        // Fetch similar products (for similar products section)
        if (data.category) {
          fetch("/api/products")
            .then((res) => res.json())
            .then((products) => {
              if (!isMounted) return;
              // Filter by same category, exclude current product, limit to 4
              // Fetch category products (for category products section)
              const categoryProds = products
                .filter(p => 
                  p._id !== data._id && 
                  (p.category || "Self").toLowerCase() === (data.category || "Self").toLowerCase()
                );
              setCategoryProducts(categoryProds);
            })
            .catch((err) => {
              if (isMounted) console.error(err);
            });
        }
      })
      .catch((err) => {
        if (isMounted) console.error(err);
      });

    // Fetch reviews
    fetch(`/api/products/${id}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) setReviews(data);
      })
      .catch((err) => {
        if (isMounted) console.error(err);
      });

    if (currentUser) {
      setNewReview((prev) => ({ ...prev, user: currentUser.name }));
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [id]); // Only depend on id, not currentUser

  const handleReviewImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setReviewImageFiles(files);
    
    // Convert to base64 for preview and submission
    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(imagePromises).then(base64Images => {
      setNewReview(prev => ({ ...prev, reviewImages: base64Images }));
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (newReview.rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    const res = await fetch(`/api/products/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Review submitted successfully!");
      setReviews(data.reviews);
      const currentUser = JSON.parse(localStorage.getItem("user")) || null;
      setNewReview({ user: currentUser?.name || "", rating: 0, comment: "", reviewImages: [] });
      setReviewImageFiles([]);
    } else {
      toast.error(data.message || "Failed to submit review");
    }
  };

  const handleAddToCart = async () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    
    try {
      const res = await fetch("/api/add-to-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          productId: product._id,
          size: selectedSize 
        }),
      });
      if (res.ok) {
        toast.success("Item added to cart!");
        navigate("/usercart");
      } else {
        toast.error("Please sign in to add items to cart");
        const productId = product._id || id;
        const redirectUrl = `/login?redirect=/product/${productId}&addToCart=${productId}`;
        navigate(redirectUrl);
      }
    } catch (err) {
      toast.error("Please sign in to add items to cart");
      const productId = product._id || id;
      const redirectUrl = `/login?redirect=/product/${productId}&addToCart=${productId}`;
      navigate(redirectUrl);
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Get all product images - handle base64, local paths, and Cloudinary URLs
  const allImages = product 
    ? [
        product.image, 
        ...(product.images || [])
      ].filter(Boolean).map(img => getImageSrc(img)).filter(Boolean)
    : [];

  if (!product) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-24 md:pt-28">
        <div className="modern-card p-8 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300 text-center">Loading...</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-6 sm:py-8 pt-20 sm:pt-24 md:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Product Details Section */}
          <div className="modern-card p-4 sm:p-6 md:p-8 rounded-lg mb-6 sm:mb-8">
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Product Images */}
              <div>
                {/* Main Image */}
                <div className="mb-3 sm:mb-4">
                  {allImages[selectedImage] ? (
                    <img
                      src={allImages[selectedImage]}
                      alt={product.name}
                      className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-64 sm:h-80 md:h-96 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400">No image available</p>
                    </div>
                  )}
                </div>
                
                {/* Image Thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {allImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden transition-all ${
                          selectedImage === index 
                            ? "border-primary dark:border-accent ring-2 ring-primary dark:ring-accent" 
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">{product.name}</h2>
                  
                  {/* Average Rating */}
                  {reviews.length > 0 && (
                    <div className="mb-4">
                      <StarRatingDisplay rating={averageRating} size="md" />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  )}
                  
                  <p className="text-xl sm:text-2xl font-bold text-primary dark:text-accent mb-4">
                    ₹{product.price}
                  </p>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">{product.description}</p>
                </div>

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Select Size <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {product.sizes.map((sizeItem, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            if (sizeItem.available) {
                              setSelectedSize(sizeItem.size);
                              toast.success(`Size ${sizeItem.size} selected`);
                            } else {
                              toast.error(
                                `Size ${sizeItem.size} is currently out of stock. Please select another size.`,
                                { autoClose: 4000 }
                              );
                            }
                          }}
                          disabled={!sizeItem.available}
                          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg border-2 font-medium transition text-sm sm:text-base ${
                            selectedSize === sizeItem.size
                              ? "border-primary dark:border-accent bg-primary dark:bg-accent text-white shadow-lg"
                              : sizeItem.available
                              ? "border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-accent text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                              : "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed line-through"
                          }`}
                        >
                          {sizeItem.size}
                          {!sizeItem.available && (
                            <span className="ml-1 text-xs">(Out of Stock)</span>
                          )}
                        </button>
                      ))}
                    </div>
                    {!selectedSize && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Please select a size to add this item to your cart.
                      </p>
                    )}
                    {selectedSize && (
                      <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
                        ✓ Size {selectedSize} selected
                      </p>
                    )}
                  </div>
                )}
                
                <div className="pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-800">
                  <button 
                    onClick={handleAddToCart}
                    disabled={product.sizes && product.sizes.length > 0 && !selectedSize}
                    className={`w-full py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-semibold transition ${
                      product.sizes && product.sizes.length > 0 && !selectedSize
                        ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "modern-button hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Same Category Products Section */}
          {categoryProducts.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    More from {product.category || "This Category"}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                    Explore other products in the same category
                  </p>
                </div>
                {categoryProducts.length > 9 && (
                  <Link
                    to={`/category/${encodeURIComponent(product.category || "all")}`}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-primary dark:text-accent hover:text-primary-dark dark:hover:text-accent-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-all self-start sm:self-auto"
                  >
                    View All
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {categoryProducts.slice(0, 9).map((item) => (
                  <Link
                    key={item._id}
                    to={`/product/${item._id}`}
                    className="group modern-card rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {item.image && (
                        <img
                          src={getImageSrc(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-4 sm:p-5">
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 group-hover:text-primary dark:group-hover:text-accent transition-colors">
                        {item.name || "Unnamed Product"}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 hidden sm:block">
                        {item.description || "No description available"}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg sm:text-xl font-bold gradient-text">
                          ₹{item.price || "0.00"}
                        </p>
                        <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg modern-button text-xs sm:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          View
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {categoryProducts.length > 9 && (
                <div className="mt-6 flex justify-center">
                  <Link
                    to={`/category/${encodeURIComponent(product.category || "all")}`}
                    className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl modern-button font-semibold flex items-center gap-2 text-sm sm:text-base hover:scale-105 transition-transform"
                  >
                    <span>View All {categoryProducts.length} Products</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Reviews Section - At the Bottom */}
          <div className="modern-card p-4 sm:p-6 md:p-8 rounded-lg">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">Customer Reviews</h3>
            
            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-6 sm:mb-8">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                {reviews.map((r, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-4 sm:p-6 rounded-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">{r.user}</p>
                        <StarRatingDisplay rating={r.rating} size="sm" />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3">{r.comment}</p>
                    
                    {/* Review Images */}
                    {r.reviewImages && r.reviewImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {r.reviewImages.map((img, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={img}
                            alt={`Review ${imgIndex + 1}`}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-105 transition"
                            onClick={() => window.open(img, '_blank')}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Review Form */}
            <div className="pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-800">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Write a Review</h4>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder={newReview.user || "Your Name"}
                    value={newReview.user}
                    onChange={(e) => setNewReview({ ...newReview, user: e.target.value })}
                    className="modern-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <StarRatingInput
                    rating={newReview.rating}
                    onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
                    size="lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review
                  </label>
                  <textarea
                    placeholder="Write your review..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="modern-input min-h-[100px] sm:min-h-[120px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Images (Optional, max 5)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleReviewImageChange}
                    className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 
                    file:rounded-lg file:border-0 file:text-sm file:font-semibold 
                    file:bg-primary file:text-white 
                    hover:file:bg-primary-dark cursor-pointer"
                  />
                  {reviewImageFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {reviewImageFiles.map((file, index) => (
                        <img
                          key={index}
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-16 h-16 object-cover rounded border border-gray-200 dark:border-gray-700"
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="w-full modern-button py-3 rounded-lg font-semibold text-sm sm:text-base"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <FloatingCart />
      <Footer />
    </>
  );
}
