"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import LineSidebar from "../../Animations/LineSidebar";
import { motion } from "motion/react";
import Image from "next/image";
import api from "../../../lib/api";

const getDefaultImage = (item) => {
  if (
    Array.isArray(item?.colors) &&
    item.colors.length > 0 &&
    Array.isArray(item.colors[0]?.images) &&
    item.colors[0].images.length > 0
  ) {
    return item.colors[0].images[0]?.url || "/placeholder.jpg";
  }
  if (Array.isArray(item?.images) && item.images.length > 0) {
    return item.images[0]?.url || item.images[0]?.cdnUrl || "/placeholder.jpg";
  }
  if (typeof item?.image === "string") {
    return item.image;
  }
  return "/placeholder.jpg";
};

const formatPrice = (price) => {
  return `Rs. ${price?.toLocaleString("en-IN") || 0}`;
};

const CATEGORIES = [
  "All",
  "Ladies",
  "Suits",
  "T-Shirts",
  "Sweat Shirts",
  "Hoodies",
  "Sneakers",
  "New Arrivals",
  "Specials",
  "Comics"
];

const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Name: A → Z", value: "name_asc" },
  { label: "Name: Z → A", value: "name_desc" },
];

const Products = () => {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/products/all");
        setProducts(res.data);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);


  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortValue, setSortValue] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  
  const limit = pathname === '/' ? 6 : 9;
  const [currentLimit, setCurrentLimit] = useState(limit);
  const observerTarget = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (pathname === '/') return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCurrentLimit((prev) => prev + 9);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [pathname]);

  const handleProductClick = (id) => router.push(`/product/${id}`);

  // Category mapping to match database enum values
  const CATEGORY_MAP = {
    All: null,
    Ladies: "ladies",
    Suits: "suits",
    "T-Shirts": "t-shirts",
    "Sweat Shirts": "sweat-shirts",
    Hoodies: "hoodies",
    Sneakers: "sneakers",
    "New Arrivals": "new-arrivals",
    Specials: "specials",
    Comics: "comics",
  };

  // Filter + sort
  const displayed = useMemo(() => {
    let list = [...(products || [])];

    // category filter
    if (activeCategory !== "All") {
      const dbCategory = CATEGORY_MAP[activeCategory];
      list = list.filter((p) => (p.category || "") === dbCategory);
    }

    // search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q),
      );
    }

    // sort
    if (sortValue === "price_asc") list.sort((a, b) => a.price - b.price);
    if (sortValue === "price_desc") list.sort((a, b) => b.price - a.price);
    if (sortValue === "name_asc")
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    if (sortValue === "name_desc")
      list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));

    return list;
  }, [products, activeCategory, searchQuery, sortValue]);

  const paginatedDisplayed = useMemo(() => {
    return displayed.slice(0, currentLimit);
  }, [displayed, currentLimit]);

  return (
    <div ref={containerRef} className="min-h-screen pt-30 px-5">
      <div>
        <motion.h1 
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-6xl text-[#B18D57] head font-bold products-title"
        >
          Products
        </motion.h1>
      </div>
      <div className="flex min-h-[calc(100vh-180px)] pt-10">
        {/* ── Sidebar ── */}
        <motion.aside 
          initial={{ x: -30, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="products-sidebar hidden md:flex flex-col w-56 lg:w-64 flex-shrink-0 pt-10 pb-10 px-6 sticky top-0 h-screen overflow-y-auto"
        >
          <p className="text-lg tracking-[0.2em] uppercase mb-15 font-medium">
            Categories
          </p>
          <LineSidebar
            items={CATEGORIES}
            defaultActive={0}
            onItemClick={(index, label) => setActiveCategory(label)}
            accentColor="#AF8B57"
            textColor="#5D1A2E"
            markerColor="#5D1A2E"
          />
        </motion.aside>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* ── Toolbar ── */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 lg:px-8 pt-8 pb-6 border-b border-white/8">
            {/* Mobile category scroll */}
            <div className="flex md:hidden gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 text-xs tracking-widest px-3.5 py-1.5 rounded-full border transition-all ${
                    activeCategory === cat
                      ? "border-white  bg-white/20"
                      : "border-white  hover:border-white hover:"
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1 hidden sm:block" />

            {/* Result count */}
            {!isLoading && !error && (
              <p className="text-xs  tracking-widest hidden sm:block">
                {displayed.length} ITEM{displayed.length !== 1 ? "S" : ""}
              </p>
            )}

            {/* Sort dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSortOpen((o) => !o)}
                className="flex items-center gap-2 text-sm  hover: border border-white/10 hover:border-white px-4 py-2.5 rounded-lg transition-all"
              >
                Sort
                <ChevronDown
                  size={14}
                  className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}
                />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-950 border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortValue(opt.value);
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        sortValue === opt.value
                          ? " bg-white/20"
                          : " hover: hover:bg-white/5"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── States ── */}
          <div className="flex-1 px-5 lg:px-8 py-8">
            {isLoading && (
              <div className="flex items-center justify-center py-24  text-sm tracking-widest">
                Loading products...
              </div>
            )}

            {error && !isLoading && (
              <div className="flex items-center justify-center py-24 text-red-400/70 text-sm">
                {error}
              </div>
            )}

            {!isLoading && !error && displayed.length === 0 && (
              <div className="flex items-center justify-center py-24  text-sm tracking-widest">
                No products found.
              </div>
            )}

            {/* ── Product grid ── */}
            {!isLoading && !error && displayed.length > 0 && (
              <div className="products-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedDisplayed.map((item, index) => (
                  <motion.button
                    initial={{ y: 40, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: (index % 9) * 0.05, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-50px" }}
                    key={item._id || item.id}
                    type="button"
                    onClick={() => handleProductClick(item._id || item.id)}
                    style={{ willChange: "transform" }}
                    className="product-card group text-left border border-white/8 overflow-hidden hover:border-[#B08D57]/30 hover:scale-[1.03] transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={getDefaultImage(item)}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = "/placeholder.jpg";
                          e.target.srcset = "";
                        }}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h2 className="text-sm font-medium  leading-snug line-clamp-2 flex-1">
                          {item.name}
                        </h2>
                        <span className="text-sm font-semibold  flex-shrink-0">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                      <p className="text-xs  line-clamp-2 leading-relaxed">
                        {item.description || "No description available."}
                      </p>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.type && (
                          <span className="text-[10px] tracking-widest  border border-white/10 px-2.5 py-0.5 rounded-full uppercase">
                            {item.type}
                          </span>
                        )}
                        {item.category && item.category !== item.type && (
                          <span className="text-[10px] tracking-widest  border border-white/10 px-2.5 py-0.5 rounded-full uppercase">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && !error && displayed.length > currentLimit && pathname === '/' && (
              <div className="flex justify-center mt-12 pb-8">
                <button
                  onClick={() => router.push('/products')}
                  className="px-10 py-3 bg-[#AF8B57] text-[#111] hover:bg-[#C9A74D] hover:scale-[1.05] rounded-full text-sm font-semibold tracking-widest transition-all duration-300 shadow-xl"
                >
                  LOAD MORE
                </button>
              </div>
            )}
            
            {!isLoading && !error && displayed.length > currentLimit && pathname !== '/' && (
              <div ref={observerTarget} className="flex justify-center mt-12 pb-8">
                <div className="w-8 h-8 border-2 border-[#AF8B57] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
