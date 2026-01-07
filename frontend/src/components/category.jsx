import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import Footer from "./Footer";
import FloatingCart from "./FloatingCart";
import { ShoppingBag, Star, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";

export default function CategoryPage() {
  const navigate = useNavigate();
  const { name } = useParams();
  const decodedName = decodeURIComponent(name || "");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSmall, setIsSmall] = useState(false);
  const [showAll, setShowAll] = useState(false);
  
  // Get search query from URL
  const searchParams = new URLSearchParams(window.location.search);
  const searchQuery = searchParams.get("search") || "";

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
    let result = products;
    const target = decodedName.toLowerCase();
    
    // Apply category filter
    if (target === "all") {
      result = products;
    } else if (target === "popular") {
      result = products.filter((p) => p.isPopular);
    } else {
      result = products.filter(
        (p) => (p.category || "Self").toLowerCase() === target
      );
    }
    
    // Apply search filter if search query exists
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [products, decodedName, searchQuery]);

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

  const heading = searchQuery.trim().length > 0
    ? `Search Results for "${searchQuery}"`
    : isAll ? "All categories" : isPopular ? "Popular products" : decodedName;
  const subtext = searchQuery.trim().length > 0
    ? `Found ${filtered.length} product${filtered.length !== 1 ? "s" : ""} matching your search`
    : isAll
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-24 md:pt-28">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm text-primary dark:text-accent uppercase tracking-wider mb-2 font-semibold">Category</p>
              <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">{heading}</h1>
              <p className="text-gray-700 dark:text-gray-300">{subtext}</p>
            </div>
            <Link
              to="/"
              className="hidden md:flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-primary dark:hover:border-accent hover:text-primary dark:hover:text-accent font-semibold transition-all"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to home
            </Link>
          </div>

        {loading ? (
          <div className="text-sm text-gray-700 dark:text-gray-300 modern-card p-4 rounded-lg text-center">Loading products...</div>
        ) : searchQuery.trim().length > 0 ? (
          // Show search results
          filtered.length === 0 ? (
            <div className="modern-card rounded-lg p-6 text-center">
              <p className="text-gray-700 dark:text-gray-300">
                No products found matching "{searchQuery}".
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item, idx) => (
                <div
                  key={item._id}
                  className="group modern-card rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 animate-fade-in-up cursor-pointer"
                  style={{ animationDelay: `${idx * 100}ms` }}
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={`data:image/jpeg;base64,${item.image}`}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-primary dark:group-hover:text-accent transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                      {item.description}
                    </p>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-shrink-0">
                          <p className="text-xl md:text-2xl font-bold gradient-text whitespace-nowrap">
                            ₹{item.price}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item._id);
                          }}
                          className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl modern-button text-xs md:text-sm font-semibold flex items-center gap-1.5 md:gap-2 flex-shrink-0 hover:scale-105 transition-transform"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span className="hidden sm:inline">Add to Cart</span>
                          <span className="sm:hidden">Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : isAll ? (
          grouped.length === 0 ? (
            <div className="modern-card rounded-lg p-6 text-center">
              <p className="text-gray-700 dark:text-gray-300">
                No products found yet.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {grouped.map(([cat, items]) => (
                <div key={cat} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{cat}</h2>
                    <span className="text-xs text-gray-600 modern-badge">
                      {items.length} item{items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item, idx) => (
                      <div
                        key={item._id}
                        className="group modern-card rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 animate-fade-in-up cursor-pointer"
                        style={{ animationDelay: `${idx * 100}ms` }}
                        onClick={() => navigate(`/product/${item._id}`)}
                      >
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={`data:image/jpeg;base64,${item.image}`}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            </div>
                          </div>
                        </div>
                        <div className="p-5 space-y-3">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-primary dark:group-hover:text-accent transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                            <div>
                              <p className="text-2xl font-bold gradient-text">₹{item.price}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(item._id);
                              }}
                              className="px-5 py-2.5 rounded-xl modern-button text-sm font-semibold flex items-center gap-2"
                            >
                              <ShoppingBag className="w-4 h-4" />
                              Add to Cart
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
            <p className="text-gray-600 dark:text-gray-300">
              {searchQuery.trim().length > 0
                ? `No products found matching "${searchQuery}".`
                : "No products found in this category yet."}
            </p>
          </div>
        ) : (
          <>
          <div className={`${isSmall && decodedName.toLowerCase() === "popular" ? "grid gap-5 grid-cols-2" : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"}`}>
            {displayed.map((item, idx) => (
              <div
                key={item._id}
                className="group modern-card rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${idx * 100}ms` }}
                onClick={() => navigate(`/product/${item._id}`)}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={`data:image/jpeg;base64,${item.image}`}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-green-400 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                    {item.description}
                  </p>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-shrink-0">
                        <p className="text-xl md:text-2xl font-bold gradient-text whitespace-nowrap">
                          ₹{item.price}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item._id);
                        }}
                        className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl modern-button text-xs md:text-sm font-semibold flex items-center gap-1.5 md:gap-2 flex-shrink-0 hover:scale-105 transition-transform"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Add to Cart</span>
                        <span className="sm:hidden">Add</span>
                      </button>
                    </div>
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
                className="text-xs text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-accent transition modern-button-secondary px-4 py-2 rounded-lg"
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


