// src/pages/ProductPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProductPage() {
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

  if (!product) return <p className="text-white text-center">Loading...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 p-6">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-700">
        
        {/* Product Info */}
        <div className="mb-10">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover rounded-xl mb-6"
          />
          <h2 className="text-3xl font-bold text-white mb-2">{product.name}</h2>
          <p className="text-gray-300 mb-4">{product.description}</p>
          <p className="text-xl font-semibold text-pink-400 mb-6">
            ₹ {product.price}
          </p>
          <button className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-2 rounded-xl hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 transition duration-300 shadow-lg hover:shadow-pink-500/40">
            Buy Now
          </button>
        </div>

        {/* Reviews Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-4">Customer Reviews</h3>
          {reviews.length === 0 ? (
            <p className="text-gray-400">No reviews yet. Be the first to review!</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((r, i) => (
                <li
                  key={i}
                  className="bg-gray-800 border border-gray-700 p-4 rounded-xl shadow"
                >
                  <p className="text-sm text-gray-400">{r.user} • ⭐ {r.rating}</p>
                  <p className="text-white mt-1">{r.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add Review Form */}
        <div>
          <h3 className="text-2xl font-semibold text-white mb-4">Write a Review</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <input
              type="text"
              placeholder={currentUser?.name || "Your Name"}
              value={newReview.user}
              onChange={(e) => setNewReview({ ...newReview, user: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
              required
            />
            <select
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
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
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-2 rounded-xl hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 transition duration-300 shadow-lg hover:shadow-pink-500/40"
            >
              Submit Review
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
