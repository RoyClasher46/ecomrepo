import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowRight, Sparkles, TrendingUp, Star, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "./navbar";
import Footer from "./Footer";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: "0",
    totalProducts: "0",
    averageRating: "4.5"
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
    
    // Fetch homepage statistics
    fetch("/api/home-stats")
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error("Failed to fetch stats");
      })
      .then((data) => {
        setStats({
          totalUsers: data.totalUsersFormatted || data.totalUsers?.toString() || "0",
          totalProducts: data.totalProductsFormatted || data.totalProducts?.toString() || "0",
          averageRating: data.averageRating?.toString() || "4.5"
        });
      })
      .catch((err) => {
        console.error("Failed to load stats:", err);
        // Keep default values
      });
  }, []);

  const featured = useMemo(() => {
    const popular = products.filter((p) => p.isPopular);
    return popular.slice(0, 6);
  }, [products]);

  const newProducts = useMemo(() => {
    const cutoff = Date.now() - 5 * 24 * 60 * 60 * 1000;
    return [...products]
      .filter((p) => {
        if (!p?.createdAt) return false;
        const t = new Date(p.createdAt).getTime();
        if (Number.isNaN(t)) return false;
        return t >= cutoff;
      })
      .sort((a, b) => {
        const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
  }, [products]);

  const heroProduct = useMemo(() => {
    const featuredIds = new Set(featured.map(p => p._id));
    const available = products.filter(p => !featuredIds.has(p._id));
    return available.find((p) => p.isPopular) || available[0] || products[0];
  }, [products, featured]);

  const heroSlides = useMemo(() => {
    if (newProducts.length > 0) return newProducts;
    return heroProduct ? [heroProduct] : [];
  }, [newProducts, heroProduct]);

  const heroDisplay = heroSlides[heroSlideIndex] || null;

  useEffect(() => {
    setHeroSlideIndex(0);
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const id = setInterval(() => {
      setHeroSlideIndex((i) => (i + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [heroSlides.length]);

  const heroPrev = () => {
    if (heroSlides.length <= 1) return;
    setHeroSlideIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length);
  };

  const heroNext = () => {
    if (heroSlides.length <= 1) return;
    setHeroSlideIndex((i) => (i + 1) % heroSlides.length);
  };

  const arrivalsAll = useMemo(() => {
    return [...products].sort((a, b) => {
      const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
  }, [products]);
  
  const categoriesList = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const key = (p.category || "Self").trim();
      if (!map.has(key)) {
        map.set(key, {
          _id: p._id,
          name: key,
          image: p.image,
        });
      }
    });
    return Array.from(map.values()).slice(0, 8);
  }, [products]);

  const visibleCategories = categoriesExpanded
    ? categoriesList
    : categoriesList.slice(0, 4);

  const handleOrder = (productId) => {
    navigate(`/product/${productId}`);
  };
  const goCatalog = () => navigate("/category/all");

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100/50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
        {/* Hero Section */}
        <section className="relative pt-20 sm:pt-24 pb-12 sm:pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 dark:bg-accent/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 dark:bg-accent/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary dark:text-accent" />
                <span className="text-xs sm:text-sm font-semibold text-primary dark:text-accent">Welcome to ShopEase</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="gradient-text">
                  Discover
                </span>
                <br />
                <span className="text-gray-900 dark:text-gray-100">Amazing Products</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                Explore our curated collection of premium products. From fashion to electronics, 
                find everything you need with fast delivery and exceptional quality.
              </p>
              
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <button
                  onClick={goCatalog}
                  className="group px-6 sm:px-8 py-3 sm:py-4 rounded-xl modern-button text-sm sm:text-base font-semibold flex items-center justify-center gap-2"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  to="/login"
                  className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-primary dark:hover:border-accent hover:text-primary dark:hover:text-accent font-semibold transition-all text-sm sm:text-base text-center"
                >
                  Sign In
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-4 sm:gap-6 md:gap-8 pt-4 flex-wrap">
                <div className="flex-1 min-w-[100px] sm:min-w-[120px]">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">{stats.totalUsers}</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Happy Customers</div>
                </div>
                <div className="flex-1 min-w-[100px] sm:min-w-[120px]">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text dark:text-green-400">{stats.totalProducts}</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Products</div>
                </div>
                <div className="flex-1 min-w-[100px] sm:min-w-[120px]">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text dark:text-green-400 flex items-center gap-1">
                    {stats.averageRating}
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
                </div>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="relative mt-8 lg:mt-0">
              {heroDisplay ? (
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>
                  <img
                    src={heroDisplay.image.startsWith('data:') ? heroDisplay.image : heroDisplay.image.startsWith('/uploads/') ? heroDisplay.image : `data:image/jpeg;base64,${heroDisplay.image}`}
                    alt={heroDisplay.name}
                    className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
                  />
                  {newProducts.length > 0 && (
                    <div className="absolute top-6 left-6 z-20">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-sm font-semibold text-primary dark:text-accent shadow-lg">
                        <TrendingUp className="w-4 h-4" />
                        New Arrival
                      </span>
                    </div>
                  )}
                  {heroSlides.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={heroPrev}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 shadow-xl flex items-center justify-center transition-all hover:scale-110"
                        aria-label="Previous"
                      >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={heroNext}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 shadow-xl flex items-center justify-center transition-all hover:scale-110"
                        aria-label="Next"
                      >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {heroSlides.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setHeroSlideIndex(idx)}
                            className={`h-2 rounded-full transition-all ${
                              idx === heroSlideIndex 
                                ? "w-8 bg-white" 
                                : "w-2 bg-white/50 hover:bg-white/75"
                            }`}
                            aria-label={`Slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 z-20 text-white">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">{heroDisplay.name}</h3>
                    <p className="text-base sm:text-lg font-semibold">₹{heroDisplay.price}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl sm:rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <div className="text-gray-400 dark:text-gray-500">Loading...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-16">
        <div className="grid xl:grid-cols-[2fr_1fr] gap-6 sm:gap-8">
          {/* Products Section */}
          <div className="space-y-12 sm:space-y-16">
            {featured.length > 0 && (
              <Section
                id="popular"
                title="Popular Products"
                description="Best selling items this week"
                products={featured}
                handleOrder={handleOrder}
                icon={<TrendingUp className="w-6 h-6" />}
              />
            )}

            {arrivalsAll.length > 0 && (
              <Section
                id="new-items"
                title="Discover All Products"
                description="Explore our complete collection"
                products={arrivalsAll.slice(0, 9)}
                allProductsCount={arrivalsAll.length}
                handleOrder={handleOrder}
                icon={<Sparkles className="w-6 h-6" />}
              />
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 hidden xl:block">
            <div className="modern-card rounded-2xl p-6 space-y-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold gradient-text flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Categories
                </h3>
                <Link
                  to="/category/all"
                  className="text-sm text-primary dark:text-accent hover:text-primary-dark dark:hover:text-accent-dark font-medium transition-colors"
                >
                  View all
                </Link>
              </div>
              <div className={`grid grid-cols-2 gap-3 ${categoriesExpanded ? "" : "max-h-80 overflow-hidden"}`}>
                {visibleCategories.map((item) => (
                  <Link
                    to={`/category/${encodeURIComponent(item.name)}`}
                    key={item._id}
                    className="group relative rounded-xl overflow-hidden modern-card hover:shadow-xl transition-all"
                  >
                    <img
                      src={item.image.startsWith('data:') ? item.image : item.image.startsWith('/uploads/') ? item.image : `data:image/jpeg;base64,${item.image}`}
                      alt={item.name}
                      className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <p className="absolute bottom-2 left-2 right-2 text-white text-sm font-semibold drop-shadow-lg">
                      {item.name}
                    </p>
                  </Link>
                ))}
              </div>
                  {categoriesList.length > 4 && (
                <button
                  onClick={() => setCategoriesExpanded((s) => !s)}
                  className="w-full text-sm text-primary dark:text-accent hover:text-primary-dark dark:hover:text-accent-dark font-medium transition-colors py-2"
                >
                  {categoriesExpanded ? "Show less" : "View all categories"}
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>

        <Footer />

        <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
      </div>
    </>
  );
}

function Section({ id, title, description, products, handleOrder, icon, allProductsCount }) {
  if (products.length === 0) return null;

  const showViewMore = id === "new-items" && allProductsCount && allProductsCount > 9;

  return (
    <section id={id} className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            {icon}
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">{title}</h3>
          </div>
          {description && (
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{description}</p>
          )}
        </div>
        {id === "popular" && (
          <Link
            to={`/category/popular`}
            className="flex items-center gap-2 text-sm text-indigo-600 dark:text-accent hover:text-indigo-700 dark:hover:text-accent-dark font-semibold transition-colors self-start sm:self-auto"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map((item, idx) => (
          <ProductCard key={item._id} item={item} handleOrder={handleOrder} delay={idx * 100} />
        ))}
      </div>

      {showViewMore && (
        <div className="flex justify-center pt-4">
          <Link
            to="/category/all"
            className="group px-6 sm:px-8 py-3 sm:py-4 rounded-xl modern-button text-sm sm:text-base font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <span>View More Products</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </section>
  );
}

function ProductCard({ item, handleOrder, delay = 0 }) {
  return (
    <div
      className="group modern-card rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 animate-fade-in-up cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => handleOrder(item._id)}
    >
      <div className="relative h-48 sm:h-56 overflow-hidden">
        {item.image && (
          <img
            src={item.image.startsWith('data:') ? item.image : item.image.startsWith('/uploads/') ? item.image : `data:image/jpeg;base64,${item.image}`}
            alt={item.name || "Product"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-5 space-y-2 sm:space-y-3">
        <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-primary dark:group-hover:text-accent transition-colors">
          {item.name || "Unnamed Product"}
        </h4>
        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm line-clamp-2">
          {item.description || "No description available"}
        </p>
        <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex-shrink-0">
              <p className="text-lg sm:text-xl md:text-2xl font-bold gradient-text whitespace-nowrap">
                ₹{item.price || "0.00"}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOrder(item._id);
              }}
              className="px-3 sm:px-4 md:px-5 py-2 md:py-2.5 rounded-lg sm:rounded-xl modern-button text-xs md:text-sm font-semibold flex items-center gap-1.5 md:gap-2 flex-shrink-0 hover:scale-105 transition-transform"
            >
              <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Add to Cart</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
