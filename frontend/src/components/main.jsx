import React, { useState, useEffect, useMemo } from "react";
import Navbar from "./navbar";
import Footer from "./Footer";
import FloatingCart from "./FloatingCart";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

export default function Main() {
  const [products, setProducts] = useState([]);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  const handleOrder = (productId) => {
    // Navigate to product page instead of directly adding to cart
    navigate(`/product/${productId}`);
  };

  // Get unique products for different sections
  const featuredProducts = useMemo(() => {
    const popular = products.filter((p) => p.isPopular);
    return popular.slice(0, 6);
  }, [products]);

  const allProductsSorted = useMemo(() => {
    return [...products].sort((a, b) => {
      const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
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

  const heroSlides = useMemo(() => {
    if (newProducts.length > 0) return newProducts;
    return products.length > 0 ? [products[0]] : [];
  }, [newProducts, products]);

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

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900">
                Welcome to ShopEase
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Discover the best deals on fashion, electronics, and home essentials.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/category/all"
                  className="inline-block px-8 py-3 rounded-lg modern-button font-semibold"
                >
                  Browse All Products
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

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="grid xl:grid-cols-[2fr_1fr] gap-8">
          <div className="space-y-12">
            <MainSection
              id="popular"
              title="Popular Products"
              description="Best selling items"
              products={featuredProducts}
              onAdd={handleOrder}
            />

            <MainSection
              id="all"
              title="Discover All Products"
              description="All products in our store"
              products={allProductsSorted}
              onAdd={handleOrder}
            />
          </div>

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
      </section>

      <FloatingCart />
      <Footer />
    </div>
  );
}

function MainSection({ id, title, description, products, onAdd }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
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
            <div className="relative h-48 cursor-pointer" onClick={() => window.location.assign(`/product/${item._id}`)}>
              {item.image && (
                <img
                  src={`data:image/jpeg;base64,${item.image}`}
                  alt={item.name || "Product"}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-5 flex flex-col gap-3 h-full">
              <h4 className="text-lg font-semibold text-gray-900 line-clamp-2">{item.name || "Unnamed Product"}</h4>
              <p className="text-gray-600 text-sm line-clamp-2 flex-1">{item.description || "No description available"}</p>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                <p className="text-gray-900 font-bold text-xl">₹{item.price || "0.00"}</p>
                <button
                  onClick={() => onAdd(item._id)}
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
