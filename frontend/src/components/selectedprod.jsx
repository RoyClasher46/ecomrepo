// src/pages/ProductPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import { toast } from "react-toastify";

export default function ProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ user: "", rating: 5, comment: "" });
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error(err));

    fetch(`http://localhost:5000/api/products/${id}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error(err));

    if (currentUser) {
      setNewReview((prev) => ({ ...prev, user: currentUser.name }));
    }
  }, [id]);

  

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:5000/api/products/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview),
    });
    const data = await res.json();
    setReviews(data.reviews);
    setNewReview({ user: "", rating: 5, comment: "" });
  };

  const handleAddToCart = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/add-to-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product._id }),
      });
      if (res.ok) {
        toast.success("Item added to cart!");
        navigate("/usercart");
      } else {
        toast.error("Please sign in to add items to cart");
        navigate("/login");
      }
    } catch (err) {
      toast.error("Please sign in to add items to cart");
      navigate("/login");
    }
  };

  if (!product) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="modern-card p-8 rounded-lg">
          <p className="text-gray-600 text-center">Loading...</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="modern-card p-8 rounded-lg">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Product Image */}
              <div>
                <img
                  src={product.image?.startsWith('data:') ? product.image : `data:image/jpeg;base64,${product.image}`}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg border border-gray-200"
                />
              </div>
              
              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{product.name}</h2>
                  <p className="text-2xl font-bold text-primary mb-4">
                    ${product.price}
                  </p>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <button 
                    onClick={handleAddToCart}
                    className="w-full modern-button py-3 rounded-lg text-base font-semibold"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12 modern-card p-8 rounded-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Customer Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-gray-600">No reviews yet. Be the first to review!</p>
            ) : (
              <ul className="space-y-4 mb-8">
                {reviews.map((r, i) => (
                  <li
                    key={i}
                    className="bg-gray-50 border border-gray-200 p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-semibold text-gray-900">{r.user}</p>
                      <span className="text-warning">⭐ {r.rating}</span>
                    </div>
                    <p className="text-gray-700">{r.comment}</p>
                  </li>
                ))}
              </ul>
            )}

            {/* Add Review Form */}
            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h4>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder={currentUser?.name || "Your Name"}
                  value={newReview.user}
                  onChange={(e) => setNewReview({ ...newReview, user: e.target.value })}
                  className="modern-input"
                  required
                />
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                  className="modern-input"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} Star{num > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Write your review..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="modern-input min-h-[100px]"
                  required
                />
                <button
                  type="submit"
                  className="w-full modern-button py-3 rounded-lg"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
