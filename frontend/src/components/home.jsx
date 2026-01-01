import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";   


export default function Home() {
  const [products, setProducts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const navigate = useNavigate();




  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  // Get unique products for each section
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
    // Use a different product for hero (not in featured)
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
    }, 3500);
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

  const handleOrder = () => {
    toast.error("Please sign in to add items to your cart.");
    navigate("/login");
  };
  const goCatalog = () => navigate("/category/all");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-4 pb-8 lg:pt-8">
        {/* Navigation Bar */}
        <nav className="hidden xl:flex items-center justify-between rounded-lg px-6 py-4 modern-card mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-xl font-semibold text-white">
              🛍️
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Premium Store
              </p>
              <p className="text-lg font-semibold gradient-text">ShopEase</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-700">
            <Link to="/" className="hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <a href="#popular" className="hover:text-primary transition-colors font-medium">
              Products
            </a>
            <Link to="/login" className="hover:text-primary transition-colors font-medium">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-lg modern-button text-sm font-semibold"
            >
              Create account
            </Link>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="block xl:hidden mb-6">
          <MobilePanel
            heroProduct={heroDisplay}
            featured={featured}
            categories={categoriesList}
            categoriesExpanded={categoriesExpanded}
            setCategoriesExpanded={setCategoriesExpanded}
            handleOrder={handleOrder}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            goCatalog={goCatalog}
          />
        </div>

        {/* Hero Section */}
        <section className="mb-12">
          <div className="modern-card rounded-lg p-8 md:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <span className="inline-flex items-center gap-2 modern-badge px-3 py-1 rounded-full text-xs font-semibold mb-4">
                    Welcome to ShopEase
                  </span>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                    Discover Amazing Products
                  </h1>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Explore our curated collection of premium products. From fashion to electronics, 
                    find everything you need with fast delivery and exceptional quality.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={goCatalog}
                    className="px-6 py-3 rounded-lg modern-button text-sm font-semibold"
                  >
                    Shop Now
                  </button>
                  <Link
                    to="/login"
                    className="px-6 py-3 rounded-lg modern-button-secondary text-sm font-semibold"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg h-80 bg-gray-100 flex items-center justify-center">
                {heroDisplay ? (
                  <>
                    <img
                      src={`data:image/jpeg;base64,${heroDisplay.image}`}
                      alt={heroDisplay.name}
                      className="w-full h-full object-cover"
                    />
                    {newProducts.length > 0 && (
                      <span className="absolute top-3 left-3 modern-badge px-3 py-1 rounded-full text-xs font-semibold">
                        New
                      </span>
                    )}
                    {heroSlides.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={heroPrev}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-900 shadow flex items-center justify-center"
                          aria-label="Previous"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={heroNext}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-900 shadow flex items-center justify-center"
                          aria-label="Next"
                        >
                          ›
                        </button>
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                          {heroSlides.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setHeroSlideIndex(idx)}
                              className={`w-2.5 h-2.5 rounded-full ${
                                idx === heroSlideIndex ? "bg-primary" : "bg-white/70"
                              }`}
                              aria-label={`Slide ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-gray-500">Loading new items...</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid xl:grid-cols-[2fr_1fr] gap-8">
          <div className="space-y-12">
            <Section
              id="popular"
              title="Popular Products"
              description="Best selling items"
              products={featured}
              handleOrder={handleOrder}
            />

            {arrivalsAll.length > 0 && (
              <Section
                id="new-items"
                title="Discover All Products"
                description="All products in our store"
                products={arrivalsAll}
                handleOrder={handleOrder}
              />
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 hidden xl:block">
            <div className="modern-card rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-gray-900">Shop by Category</p>
                <Link
                  to="/category/all"
                  className="text-xs text-primary hover:text-primary-dark transition font-medium"
                >
                  View all
                </Link>
              </div>
              <div className={`grid grid-cols-2 gap-3 ${categoriesExpanded ? "" : "max-h-64 overflow-hidden"}`}>
                {visibleCategories.map((item) => (
                  <Link
                    to={`/category/${encodeURIComponent(item.name)}`}
                    key={item._id}
                    className="relative rounded-lg overflow-hidden modern-card hover:shadow-medium transition group"
                  >
                    <img
                      src={`data:image/jpeg;base64,${item.image}`}
                      alt={item.name}
                      className="w-full h-20 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <p className="absolute bottom-2 left-2 text-white text-sm font-semibold drop-shadow">
                      {item.name}
                    </p>
                  </Link>
                ))}
                {categoriesList.length === 0 && (
                  <div className="text-sm text-gray-600 col-span-2">Loading categories...</div>
                )}
              </div>
              {categoriesList.length > 4 && (
                <button
                  onClick={() => setCategoriesExpanded((s) => !s)}
                  className="text-xs text-primary hover:text-primary-dark transition font-medium w-full text-center"
                >
                  {categoriesExpanded ? "Show less" : "View all categories"}
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, description, products, handleOrder, badge }) {
  if (products.length === 0) return null;

  return (
    <section id={id} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <Link
          to={`/category/${id === "popular" ? "popular" : "all"}`}
          className="text-sm text-primary hover:text-primary-dark transition font-medium"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((item) => (
          <div
            key={item._id}
            className="modern-card rounded-lg overflow-hidden flex flex-col min-h-[280px] hover:shadow-medium transition"
          >
            <div className="relative h-48">
              {item.image && (
                <img
                  src={`data:image/jpeg;base64,${item.image}`}
                  alt={item.name || "Product"}
                  className="w-full h-full object-cover"
                />
              )}
              {badge && (
                <span className="absolute top-3 left-3 modern-badge px-3 py-1 rounded-full text-xs font-semibold">
                  {badge}
                </span>
              )}
            </div>
            <div className="p-5 flex flex-col gap-3 h-full">
              <h4 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {item.name || "Unnamed Product"}
              </h4>
              <p className="text-gray-600 text-sm line-clamp-2 flex-1">
                {item.description || "No description available"}
              </p>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                <p className="text-gray-900 font-bold text-xl">${item.price || "0.00"}</p>
                <button
                  onClick={handleOrder}
                  className="px-4 py-2 rounded-lg modern-button text-sm font-semibold"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MobilePanel({
  heroProduct,
  featured,
  categories = [],
  handleOrder,
  mobileMenuOpen,
  setMobileMenuOpen,
  goCatalog,
  categoriesExpanded,
  setCategoriesExpanded,
}) {
  const categoryItems = categories.length
    ? categoriesExpanded
      ? categories.slice(0, 8)
      : categories.slice(0, 4)
    : featured;

  return (
    <div className="modern-card rounded-lg overflow-hidden relative">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-lg hover:bg-gray-200 transition"
            aria-label="Toggle menu"
          >
            ≡
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xl text-white">
              🛍️
            </div>
            <span className="text-sm font-semibold gradient-text">ShopEase</span>
          </div>
        </div>
        <Link
          to="/usercart"
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-primary transition"
        >
          🛒 Cart
        </Link>
      </div>
      <div className="p-5 space-y-6">
        <div className="space-y-3">
          <p className="text-2xl font-bold text-gray-900 leading-snug">
            Discover Amazing Products
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Welcome to ShopEase, your premium shopping destination.
            Discover a curated collection of quality products with fast delivery.
          </p>
        </div>
        <div className="space-y-4">
          <p className="text-xl font-bold text-gray-900">Shop by Category</p>
          <div className="grid grid-cols-2 gap-3">
            {categoryItems.map((item) => (
              <Link
                to={`/category/${encodeURIComponent(item.name)}`}
                key={item._id}
                className="relative rounded-lg overflow-hidden modern-card hover:shadow-medium transition group"
              >
                <img
                  src={`data:image/jpeg;base64,${item.image}`}
                  alt={item.name}
                  className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <p className="absolute bottom-2 left-2 text-white text-sm font-semibold drop-shadow">
                  {item.name}
                </p>
              </Link>
            ))}
            {categoryItems.length === 0 && (
              <div className="text-sm text-gray-600 col-span-2">Loading...</div>
            )}
          </div>
          <Link
            to="/category/all"
            className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg modern-button-secondary text-sm font-semibold"
          >
            View All Categories
          </Link>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex">
          <div className="w-64 modern-card h-full shadow-large p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold gradient-text">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-3 text-sm text-gray-700">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition">
                Home
              </Link>
              <a
                href="#popular"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-primary transition"
              >
                Products
              </a>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition">
                Sign In
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition">
                Create account
              </Link>
              <Link to="/usercart" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition">
                Cart
              </Link>
            </div>
          </div>
          <button
            className="flex-1"
            aria-label="Close menu overlay"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
