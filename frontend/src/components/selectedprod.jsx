// src/pages/ProductPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "./navbar";
import Footer from "./Footer";
import FloatingCart from "./FloatingCart";
import { toast } from "react-toastify";
import { StarRatingDisplay, StarRatingInput } from "./StarRating";

export default function ProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [newReview, setNewReview] = useState({ 
    user: "", 
    rating: 0, 
    comment: "",
    reviewImages: []
  });
  const [reviewImageFiles, setReviewImageFiles] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user")) || null;

  // Scroll to top when component mounts or product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        // Fetch similar products
        if (data.category) {
          fetch("/api/products")
            .then((res) => res.json())
            .then((products) => {
              // Filter by same category, exclude current product, limit to 4
              const similar = products
                .filter(p => 
                  p._id !== data._id && 
                  (p.category || "Self").toLowerCase() === (data.category || "Self").toLowerCase()
                )
                .slice(0, 4);
              setSimilarProducts(similar);
            })
            .catch((err) => console.error(err));
        }
      })
      .catch((err) => console.error(err));

    fetch(`/api/products/${id}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error(err));

    if (currentUser) {
      setNewReview((prev) => ({ ...prev, user: currentUser.name }));
    }
  }, [id]);

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

  // Get all product images
  const allImages = product 
    ? [
        product.image, 
        ...(product.images || [])
      ].filter(Boolean).map(img => 
        img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`
      )
    : [];

  if (!product) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 pt-24 md:pt-28">
        <div className="modern-card p-8 rounded-lg">
          <p className="text-gray-600 text-center">Loading...</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 py-8 pt-24 md:pt-28">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Product Details Section */}
          <div className="modern-card p-8 rounded-lg mb-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Product Images */}
              <div>
                {/* Main Image */}
                <div className="mb-4">
                  {allImages[selectedImage] && (
                    <img
                      src={allImages[selectedImage]}
                      alt={product.name}
                      className="w-full h-96 object-cover rounded-lg border border-gray-200"
                    />
                  )}
                </div>
                
                {/* Image Thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {allImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                          selectedImage === index 
                            ? "border-primary" 
                            : "border-gray-200"
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
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{product.name}</h2>
                  
                  {/* Average Rating */}
                  {reviews.length > 0 && (
                    <div className="mb-4">
                      <StarRatingDisplay rating={averageRating} size="md" />
                      <span className="ml-2 text-sm text-gray-600">
                        ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  )}
                  
                  <p className="text-2xl font-bold text-primary mb-4">
                    ₹{product.price}
                  </p>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Size <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
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
                                `We're sorry, but size ${sizeItem.size} is currently out of stock. Please select another size or check back later.`,
                                { autoClose: 5000 }
                              );
                            }
                          }}
                          disabled={!sizeItem.available}
                          className={`px-4 py-2 rounded-lg border-2 font-medium transition ${
                            selectedSize === sizeItem.size
                              ? "border-primary bg-primary text-white"
                              : sizeItem.available
                              ? "border-gray-300 hover:border-primary text-gray-700"
                              : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                          }`}
                        >
                          {sizeItem.size}
                          {!sizeItem.available && " (Out of Stock)"}
                        </button>
                      ))}
                    </div>
                    {!selectedSize && (
                      <p className="text-xs text-gray-500 mt-2">
                        Please select a size to add this item to your cart.
                      </p>
                    )}
                  </div>
                )}
                
                <div className="pt-6 border-t border-gray-200">
                  <button 
                    onClick={handleAddToCart}
                    disabled={product.sizes && product.sizes.length > 0 && !selectedSize}
                    className={`w-full py-3 rounded-lg text-base font-semibold transition ${
                      product.sizes && product.sizes.length > 0 && !selectedSize
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "modern-button"
                    }`}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Similar Products</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {similarProducts.map((item) => (
                  <Link
                    key={item._id}
                    to={`/product/${item._id}`}
                    className="modern-card rounded-lg overflow-hidden hover:shadow-medium transition"
                  >
                    <div className="w-full h-48 overflow-hidden bg-gray-100">
                      <img
                        src={`data:image/jpeg;base64,${item.image}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{item.name}</h4>
                      <p className="text-primary font-bold">₹{item.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section - At the Bottom */}
          <div className="modern-card p-8 rounded-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Customer Reviews</h3>
            
            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-gray-600 mb-8">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-6 mb-8">
                {reviews.map((r, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 border border-gray-200 p-6 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-base font-semibold text-gray-900 mb-1">{r.user}</p>
                        <StarRatingDisplay rating={r.rating} size="sm" />
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{r.comment}</p>
                    
                    {/* Review Images */}
                    {r.reviewImages && r.reviewImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {r.reviewImages.map((img, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={img}
                            alt={`Review image ${imgIndex + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:scale-105 transition"
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
            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h4>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder={currentUser?.name || "Your Name"}
                    value={newReview.user}
                    onChange={(e) => setNewReview({ ...newReview, user: e.target.value })}
                    className="modern-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <StarRatingInput
                    rating={newReview.rating}
                    onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
                    size="lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review
                  </label>
                  <textarea
                    placeholder="Write your review..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="modern-input min-h-[120px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Images (Optional, max 5)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleReviewImageChange}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
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
                          className="w-16 h-16 object-cover rounded border border-gray-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="w-full modern-button py-3 rounded-lg font-semibold"
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
