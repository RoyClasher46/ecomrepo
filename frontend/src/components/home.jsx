import React, { useState, useEffect, useMemo,useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";   


export default function Home() {
  const [products, setProducts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const navigate = useNavigate();




  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  const featured = useMemo(() => {
    const popular = products.filter((p) => p.isPopular);
    return popular.slice(0, 6);
  }, [products]);

  const newItems = useMemo(() => {
    const popular = products.filter((p) => p.isPopular);
    return popular.slice(4, 8);
  }, [products]);

  const giftSets = useMemo(() => {
    const popular = products.filter((p) => p.isPopular);
    return popular.slice(8, 12);
  }, [products]);

  const heroProduct = products.find((p) => p.isPopular) || products[0];
  
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
    <div className="eco-page min-h-screen eco-paper">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 pt-4 pb-8 lg:pt-8">
        <nav className="hidden xl:flex items-center justify-between rounded-2xl px-5 py-4 eco-border bg-white/70 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e2d7c3] flex items-center justify-center text-xl font-semibold text-[#6a5439]">
              🌱
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#7d6a52]">
                Eco Goods
              </p>
              <p className="text-lg font-semibold text-[#4e402f]">Green City</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-sm text-[#6b5a45]">
            <Link to="/" className="hover:text-[#b18a46] transition-colors">
              Home
            </Link>
            <a href="#popular" className="hover:text-[#b18a46] transition-colors">
              Products
            </a>
            <Link to="/login" className="hover:text-[#b18a46] transition-colors">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-full eco-soft-button text-sm font-semibold"
            >
              Create account
            </Link>
          </div>
        </nav>

        {/* Mobile panel mirroring the right-side layout */}
        <div className="block xl:hidden mt-6">
          <MobilePanel
            heroProduct={heroProduct}
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

        <div className="grid xl:grid-cols-[2fr_1fr] gap-8 mt-8">
          <div className="space-y-10">
            <section className="grid lg:grid-cols-2 gap-6 items-center rounded-3xl eco-card p-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 eco-badge px-3 py-1 rounded-full text-xs font-semibold">
                  Eco shop
                </span>
                <h1 className="text-4xl lg:text-5xl font-bold eco-heading text-[#4a3c2c] leading-tight">
                  Green city style eco goods store
                </h1>
                <p className="text-[#6f5c46] leading-relaxed">
                  Sustainable, reusable and certified eco products curated for
                  mindful living. Discover your next favorite items crafted with
                  care for the planet.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={goCatalog}
                    className="px-5 py-3 rounded-full eco-soft-button text-sm font-semibold"
                  >
                    Go to catalog
                  </button>
                  <Link
                    to="/login"
                    className="px-5 py-3 rounded-full border eco-border text-sm font-semibold text-[#4e402f] hover:bg-white transition-colors"
                  >
                    Fast delivery
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-[#6f5c46]">
                  <span className="eco-pill px-3 py-1 rounded-full">
                    Eco friendly goods
                  </span>
                  <span className="eco-pill px-3 py-1 rounded-full">
                    Certified products
                  </span>
                  <span className="eco-pill px-3 py-1 rounded-full">
                    Reusable packaging
                  </span>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-3xl h-full min-h-[320px] bg-gradient-to-br from-[#f2e5cf] via-[#e5d5bd] to-[#d5c1a4] flex items-center justify-center">
                {heroProduct ? (
                  <img
                    src={`data:image/jpeg;base64,${heroProduct.image}`}
                    alt={heroProduct.name}
                    className="w-64 h-64 object-cover rounded-2xl shadow-lg"
                  />
                ) : (
                  <div className="text-[#7d6a52] text-sm">
                    Loading featured item...
                  </div>
                )}
                <div className="absolute inset-4 border border-white/60 rounded-2xl pointer-events-none" />
              </div>
            </section>

            <Section
              id="popular"
              title="Popular products"
              products={featured}
              handleOrder={handleOrder}
            />

            <Section
              id="new-items"
              title="New items"
              products={newItems}
              handleOrder={handleOrder}
              badge="New"
            />

            <Section
              id="gift-sets"
              title="Gift sets"
              products={giftSets}
              handleOrder={handleOrder}
            />
          </div>

          <aside className="space-y-6 hidden xl:block">
            <div className="eco-card rounded-3xl p-6 space-y-5">
              <div className="overflow-hidden rounded-2xl h-52 bg-gradient-to-br from-[#e9dcc7] via-[#d8c7a8] to-[#c4ae8a]">
                {heroProduct ? (
                  <img
                    src={`data:image/jpeg;base64,${heroProduct.image}`}
                    alt="Eco highlight"
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div className="space-y-3">
                <p className="eco-heading text-xl text-[#4e402f]">
                  Crafted for eco-living
                </p>
                <p className="text-sm text-[#6f5c46]">
                  Natural textures, warm neutrals, and thoughtful materials to
                  keep your space calm and conscious.
                </p>
                <button
                  onClick={goCatalog}
                  className="w-full px-5 py-3 rounded-full eco-soft-button text-sm font-semibold"
                >
                  Go to catalog
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-[#6b5a45]">
                <div className="eco-border rounded-2xl p-3 bg-white/60">
                  Eco packaging
                </div>
                <div className="eco-border rounded-2xl p-3 bg-white/60">
                  Fast delivery
                </div>
                <div className="eco-border rounded-2xl p-3 bg-white/60">
                  Certified goods
                </div>
                <div className="eco-border rounded-2xl p-3 bg-white/60">
                  Customer care
                </div>
              </div>
            </div>

            <div className="eco-card rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="eco-heading text-xl text-[#4e402f]">Categories</p>
                <Link
                  to="/category/all"
                  className="text-xs text-[#b18a46] hover:text-[#a07a3e]"
                >
                  View all products
                </Link>
              </div>
              <div className={`grid grid-cols-2 gap-3 ${categoriesExpanded ? "" : "max-h-56 overflow-hidden"}`}>
                {visibleCategories.map((item) => (
                  <Link
                    to={`/category/${encodeURIComponent(item.name)}`}
                    key={item._id}
                    className="relative rounded-2xl overflow-hidden border border-white shadow-sm bg-white"
                  >
                    <img
                      src={`data:image/jpeg;base64,${item.image}`}
                      alt={item.name}
                      className="w-full h-20 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <p className="absolute bottom-2 left-2 text-white text-sm font-semibold drop-shadow-sm">
                      {item.name}
                    </p>
                  </Link>
                ))}
                {featured.length === 0 && (
                  <div className="text-sm text-[#6f5c46]">Loading...</div>
                )}
              </div>
              {categoriesList.length > 4 && (
                <div className="mt-3 flex justify-start">
                  <button
                    onClick={() => setCategoriesExpanded((s) => !s)}
                    className="text-xs text-[#b18a46] hover:text-[#a07a3e]"
                  >
                    {categoriesExpanded ? "Show less" : "View all categories"}
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, description, products, handleOrder, badge, compact }) {
  const isPopularSection = id === "popular";
  const [isSmall, setIsSmall] = React.useState(false);
  
  React.useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth < 640);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const itemsPerPage = isSmall && id === "popular" ? 4 : 3;
  const [startIndex, setStartIndex] = React.useState(0);
  const [animClass, setAnimClass] = React.useState("");
  const animTimeout = React.useRef(null);
  const total = products.length;
  const hasPagination = total > itemsPerPage;

  const visibleProducts =
    total === 0
      ? []
      : Array.from(
          { length: Math.min(itemsPerPage, total) },
          (_, i) => products[(startIndex + i) % total]
        );
  const pages = React.useMemo(() => {
    if (!isSmall) return [];
    const res = [];
    const pageSize = id === "popular" ? 4 : 2;
    for (let i = 0; i < products.length; i += pageSize) {
      res.push(products.slice(i, i + pageSize));
    }
    return res;
  }, [products, isSmall, id]);
  const itemsToRender = isSmall ? products : visibleProducts;

  const handlePrev = () => {
    if (!hasPagination) return;
    if (animTimeout.current) clearTimeout(animTimeout.current);
    setAnimClass("eco-slide-right");
    setStartIndex((prev) => (prev - 1 + total) % total);
    animTimeout.current = setTimeout(() => setAnimClass(""), 280);
  };

  const handleNext = () => {
    if (!hasPagination) return;
    if (animTimeout.current) clearTimeout(animTimeout.current);
    setAnimClass("eco-slide-left");
    setStartIndex((prev) => (prev + 1) % total);
    animTimeout.current = setTimeout(() => setAnimClass(""), 280);
  };

  React.useEffect(() => {
    return () => {
      if (animTimeout.current) clearTimeout(animTimeout.current);
    };
  }, []);

  return (
        
    <section id={id} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="eco-heading text-2xl text-[#4e402f]">{title}</h3>
          {description ? (
            <p className="text-sm text-[#7a6952]">{description}</p>
          ) : null}
        </div>
        <div className="flex gap-2 items-center">
          {/* Desktop arrows - hidden on small screens */}
          <div className={`${isSmall && id === "popular" ? "hidden sm:flex" : "flex"} gap-2 text-[#a38a64] text-sm`}>
            <button
              onClick={handlePrev}
              disabled={!hasPagination}
              className="w-8 h-8 rounded-full bg-white/70 border eco-border flex items-center justify-center disabled:opacity-40"
              aria-label="Previous products"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              disabled={!hasPagination}
              className="w-8 h-8 rounded-full bg-white/70 border eco-border flex items-center justify-center disabled:opacity-40"
              aria-label="Next products"
            >
              →
            </button>
          </div>
          {/* Mobile text link to view all products - only for popular section */}
          {isSmall && id === "popular" && (
            <div className="sm:hidden">
              <Link to="/category/popular" className="text-xs text-[#b18a46] hover:text-[#a07a3e]">
                View all
              </Link>
            </div>
          )}
        </div>
      </div>

      <div
            className={`${animClass} ${isSmall ? "flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth px-2" : "grid gap-4"} ${
              isSmall && id === "popular"
                ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3"
                : compact
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
        >
        {products.length === 0 && (
          <div className="text-sm text-[#6f5c46]">Products are loading...</div>
        )}
        {isSmall ? (
          <>
            {pages.map((page, pi) => (
              <div key={pi} className="snap-start w-full grid gap-3 grid-cols-2">
                {page.map((item) => (
                  <div
                    key={item._id}
                    className={`w-full eco-card rounded-3xl overflow-hidden flex flex-col border border-white min-h-[220px]`}
                  >
                    <div className="relative h-28">
                      <img
                        src={`data:image/jpeg;base64,${item.image}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex flex-col gap-3 h-full">
                      <p className="text-[#4e402f] font-semibold text-sm">{item.name}</p>
                      <p className="text-[#6f5c46] text-xs min-h-[28px] overflow-hidden">{item.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <p className="text-[#4e402f] font-bold text-lg">${item.price}</p>
                        <button onClick={handleOrder} className="text-xs font-semibold px-3 py-1 rounded-md bg-[#b18a46] text-white hover:bg-[#a1793d] transition-colors">Add</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        ) : (
          <>
            {itemsToRender.map((item) => (
          <div
            key={item._id}
            className={`${isSmall ? 'w-1/3 flex-shrink-0 snap-start min-h-[220px]' : 'min-h-[260px]'} eco-card rounded-3xl overflow-hidden flex flex-col border border-white`}
          >
            <div className="relative h-40">
              <img
                src={`data:image/jpeg;base64,${item.image}`}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              {badge ? (
                <span className="absolute top-3 left-3 eco-badge px-3 py-1 rounded-full text-xs font-semibold">
                  {badge}
                </span>
              ) : null}
              <button
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 border eco-border text-[#7d6a52] text-lg"
                aria-label="favorite"
              >
                ♥
              </button>
            </div>
            <div className="p-4 flex flex-col gap-3 h-full">
              <p className="text-[#4e402f] font-semibold text-base">
                {item.name}
              </p>
              <p className="text-[#6f5c46] text-sm min-h-[38px] overflow-hidden">
                {item.description}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <p className="text-[#4e402f] font-bold">${item.price}</p>
                <button
                  onClick={handleOrder}
                  className="text-xs font-semibold px-4 py-2 rounded-full bg-[#b18a46] text-white hover:bg-[#a1793d] transition-colors"
                >
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        ))}
          </>
        )}
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
    <div className="eco-card rounded-3xl overflow-hidden border eco-border relative">
      <div className="bg-[#e9ddc7] px-4 py-3 flex items-center justify-between text-[#5b4a36]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="w-9 h-9 rounded-full border eco-border bg-white/70 flex items-center justify-center text-lg"
            aria-label="Toggle menu"
          >
            ≡
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-xl">
              🌿
            </div>
            <span className="text-sm font-semibold">Green City</span>
          </div>
        </div>
        <Link
          to="/usercart"
          className="flex items-center gap-2 text-sm font-semibold text-[#6a5439]"
        >
          🛒 Cart
        </Link>
      </div>
      <div className="p-5 space-y-6">
        <div className="space-y-3 text-[#6f5c46]">
          <p className="eco-heading text-2xl text-[#4e402f] leading-snug">
            Green city style eco goods store
          </p>
          <p className="text-sm leading-relaxed">
            Welcome to our eco-conscious store, where sustainability meets style.
            Discover a curated collection of eco-friendly products.
          </p>
          <div className="rounded-2xl overflow-hidden border border-white shadow-sm">
            {heroProduct ? (
              <img
                src={`data:image/jpeg;base64,${heroProduct.image}`}
                alt="Eco highlight"
                className="w-full h-56 object-cover"
              />
            ) : (
              <div className="h-56 bg-[#e8ddc8]" />
            )}
          </div>
          <button
            onClick={goCatalog}
            className="w-full px-5 py-3 rounded-full eco-soft-button text-sm font-semibold"
          >
            Go to catalog
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-[#6b5a45]">
          <div className="eco-border rounded-2xl p-3 bg-white/70 text-center">
            Eco friendly goods
          </div>
          <div className="eco-border rounded-2xl p-3 bg-white/70 text-center">
            Eco packaging
          </div>
          <div className="eco-border rounded-2xl p-3 bg-white/70 text-center">
            Fast delivery
          </div>
          <div className="eco-border rounded-2xl p-3 bg-white/70 text-center">
            Certified products
          </div>
        </div>

        <div className="space-y-3">
          <p className="eco-heading text-xl text-[#4e402f]">Categories</p>
          <div className="grid grid-cols-2 gap-3">
            {categoryItems.map((item) => (
              <Link
                to={`/category/${encodeURIComponent(item.name)}`}
                key={item._id}
                className="relative rounded-2xl overflow-hidden border border-white shadow-sm bg-white"
              >
                <img
                  src={`data:image/jpeg;base64,${item.image}`}
                  alt={item.name}
                  className="w-full h-24 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <p className="absolute bottom-2 left-2 text-white text-sm font-semibold drop-shadow-sm">
                  {item.name}
                </p>
              </Link>
            ))}
            {categoryItems.length === 0 && (
              <div className="text-sm text-[#6f5c46]">Loading...</div>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              to="/category/all"
              className="w-full inline-flex items-center justify-center px-4 py-2 rounded-full border eco-border text-sm font-semibold text-[#4e402f] hover:bg-white transition-colors"
            >
              All products
            </Link>
            {categories.length > 4 && (
              <button 
                onClick={() => setCategoriesExpanded((s) => !s)}
                className="text-xs text-[#b18a46] hover:text-[#a07a3e] "
              >
                {categoriesExpanded ? "Show less" : "View Categories"}
              </button>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex">
          <div className="w-64 bg-white h-full shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#4e402f]">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full border eco-border bg-white/80 flex items-center justify-center"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-3 text-sm text-[#6a5439]">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#b18a46]">
                Home
              </Link>
              <a
                href="#popular"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#b18a46]"
              >
                Products
              </a>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#b18a46]">
                Sign In
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#b18a46]">
                Create account
              </Link>
              <Link to="/usercart" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#b18a46]">
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
