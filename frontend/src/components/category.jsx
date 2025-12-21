import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function CategoryPage() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name || "");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSmall, setIsSmall] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/products")
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

  return (
    <div className="min-h-screen eco-paper text-[#4e402f]">
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-[#7a6952]">Category</p>
            <h1 className="eco-heading text-3xl">{heading}</h1>
            <p className="text-sm text-[#6f5c46] mt-1">{subtext}</p>
          </div>
          <Link
            to="/"
            className="text-sm text-[#b18a46] hover:text-[#a1793d]"
          >
            ← Back to home
          </Link>
        </div>

        {loading ? (
          <div className="text-sm text-[#6f5c46]">Loading products...</div>
        ) : isAll ? (
          grouped.length === 0 ? (
            <div className="eco-card rounded-3xl p-6">
              <p className="text-[#6f5c46]">
                No products found yet.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {grouped.map(([cat, items]) => (
                <div key={cat} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="eco-heading text-2xl">{cat}</h2>
                    <span className="text-xs text-[#6f5c46]">
                      {items.length} item{items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="eco-card rounded-3xl overflow-hidden flex flex-col border border-white min-h-[260px]"
                      >
                        <div className="relative h-44">
                          <img
                            src={`data:image/jpeg;base64,${item.image}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
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
                            <button className="text-xs font-semibold px-4 py-2 rounded-full bg-[#b18a46] text-white hover:bg-[#a1793d] transition-colors">
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
          <div className="eco-card rounded-3xl p-6">
            <p className="text-[#6f5c46]">
              No products found in this category yet.
            </p>
          </div>
        ) : (
          <>
          <div className={`${isSmall && decodedName.toLowerCase() === "popular" ? "grid gap-5 grid-cols-2" : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"}`}>
            {displayed.map((item) => (
              <div
                key={item._id}
                className="eco-card rounded-3xl overflow-hidden flex flex-col border border-white min-h-[260px]"
              >
                <div className="relative h-44">
                  <img
                    src={`data:image/jpeg;base64,${item.image}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
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
                    <button className="text-xs font-semibold px-4 py-2 rounded-full bg-[#b18a46] text-white hover:bg-[#a1793d] transition-colors">
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
                className="text-xs text-[#b18a46] hover:text-[#a07a3e]"
              >
                {showAll ? "Show less" : "View all popular products"}
              </button>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}

