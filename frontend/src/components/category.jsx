import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import Footer from "./Footer";
import FloatingCart from "./FloatingCart";
import { toast } from "react-toastify";

export default function CategoryPage() {
  const navigate = useNavigate();
  const { name } = useParams();
  const decodedName = decodeURIComponent(name || "");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSmall, setIsSmall] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [decodedName]);

  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth < 640);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const filtered = useMemo(() => {
    const target = decodedName.toLowerCase();
    if (target === "all") return products;
    if (target === "popular") return products.filter((p) => p.isPopular);
    return products.filter(
      (p) => (p.category || "Self").toLowerCase() === target
    );
  }, [products, decodedName]);

  // Displayed: for popular	on mobile show only 4 by default, else show all
  const displayed = useMemo(() => {
    const target = decodedName.toLowerCase();
    if (target === "popular" && isSmall && !showAll) {
      return filtered.slice(0, 4);
    }
    return filtered;
  }, [filtered, decodedName, isSmall, showAll]);

  const grouped = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const key = (p.category || "Self").trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    });
    return Array.from(map.entries());
  }, [products]);

  const isAll = decodedName.toLowerCase() === "all";
  const isPopular = decodedName.toLowerCase() === "popular";

  const heading = isAll ? "All categories" : isPopular ? "Popular products" : decodedName;
  const subtext = isAll
    ? "Browse all products grouped by category."
    : isPopular
    ? "Browse all popular products." 
    : `Products in the "${decodedName}" category.`;

  const handleAddToCart = (productId) => {
    toast.error("Please sign in to add items to your cart.");
    navigate(`/login?redirect=/product/${productId}&addToCart=${productId}`);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Category</p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{heading}</h1>
              <p className="text-sm text-gray-600 mt-2">{subtext}</p>
            </div>
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-primary transition modern-button-secondary px-4 py-2 rounded-lg"
            >
              ← Back to home
            </Link>
          </div>

        {loading ? (
          <div className="text-sm text-gray-600 modern-card p-4 rounded-lg text-center">Loading products...</div>
        ) : isAll ? (
          grouped.length === 0 ? (
            <div className="modern-card rounded-lg p-6 text-center">
              <p className="text-gray-600">
                No products found yet.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {grouped.map(([cat, items]) => (
                <div key={cat} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{cat}</h2>
                    <span className="text-xs text-gray-600 modern-badge">
                      {items.length} item{items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="modern-card rounded-lg overflow-hidden flex flex-col min-h-[260px]"
                      >
                        <div className="relative h-44">
                          <img
                            src={`data:image/jpeg;base64,${item.image}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 flex flex-col gap-3 h-full">
                          <p className="text-gray-900 font-semibold text-base">
                            {item.name}
                          </p>
                          <p className="text-gray-600 text-sm min-h-[38px] overflow-hidden">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between mt-auto">
                            <p className="text-gray-900 font-bold text-lg">₹{item.price}</p>
                            <button 
                              onClick={() => handleAddToCart(item._id)}
                              className="text-xs font-semibold px-4 py-2 rounded-lg modern-button"
                            >
                              Add to cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filtered.length === 0 ? (
          <div className="modern-card rounded-lg p-6 text-center">
            <p className="text-gray-600">
              No products found in this category yet.
            </p>
          </div>
        ) : (
          <>
          <div className={`${isSmall && decodedName.toLowerCase() === "popular" ? "grid gap-5 grid-cols-2" : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"}`}>
            {displayed.map((item) => (
              <div
                key={item._id}
                className="modern-card rounded-lg overflow-hidden flex flex-col min-h-[260px]"
              >
                <div className="relative h-44">
                  <img
                    src={`data:image/jpeg;base64,${item.image}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col gap-3 h-full">
                  <p className="text-gray-900 font-semibold text-base">
                    {item.name}
                  </p>
                  <p className="text-gray-600 text-sm min-h-[38px] overflow-hidden">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-gray-900 font-bold text-lg">${item.price}</p>
                    <button 
                      onClick={() => handleAddToCart(item._id)}
                      className="text-xs font-semibold px-4 py-2 rounded-lg modern-button"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* mobile toggle for popular */}
          {isSmall && decodedName.toLowerCase() === "popular" && filtered.length > 4 && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowAll((s) => !s)}
                className="text-xs text-gray-600 hover:text-primary transition modern-button-secondary px-4 py-2 rounded-lg"
              >
                {showAll ? "Show less" : "View all popular products"}
              </button>
            </div>
          )}
          </>
        )}
        </div>
      </div>
      <FloatingCart />
      <Footer />
    </>
  );
}

