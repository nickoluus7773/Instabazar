"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/home/Footer";
import API_BASE_URL from "@/lib/api";

// Helper function to safely extract string name from category (string or object)
function getCategoryName(category) {
  if (!category) return "Uncategorized";
  if (typeof category === "string") return category.trim();
  if (typeof category === "object") {
    return (category.categoryName || category.name || "Other").trim();
  }
  return String(category).trim();
}


/* ─── Category Sidebar Component ─── */
function CategorySidebar({ categories, selectedCategory, onSelectCategory }) {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 sticky top-24">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>🏷️</span> Categories
          </h2>
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            {categories.length + 1}
          </span>
        </div>

        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => onSelectCategory("All")}
            className={`w-full text-left px-4 py-3 rounded-2xl transition cursor-pointer font-semibold text-sm flex items-center justify-between ${
              selectedCategory.toLowerCase() === "all"
                ? "bg-purple-600 text-white shadow-md shadow-purple-200 font-bold"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span>All Products</span>
            {selectedCategory.toLowerCase() === "all" && <span>✓</span>}
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`w-full text-left px-4 py-3 rounded-2xl transition cursor-pointer font-semibold text-sm flex items-center justify-between ${
                  isSelected
                    ? "bg-purple-600 text-white shadow-md shadow-purple-200 font-bold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{cat}</span>
                {isSelected && <span>✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
function getImageUrl(image) {
  if (!image) return "";

  // If it's already an external image URL that is NOT Django media
  if (
    (image.startsWith("http://") || image.startsWith("https://")) &&
    !image.includes("/products/")
  ) {
    return image;
  }

  // Any Django product media path:
  // /media/products/heroimg1.png
  // http://127.0.0.1:8000/media/products/heroimg1.png
  // http://127.0.0.1:8000/media/media/media/products/heroimg1.png
  if (image.includes("/products/")) {
    const filename = image.split("/products/").pop();
    return `/images/${filename}`;
  }

  return image;
}
/* ─── Product Card Component ─── */
function ProductCard({ product }) {
  const categoryName = getCategoryName(product.category);
  console.log("PRODUCT IMAGE:", product.productImage);
  console.log("FINAL IMAGE URL:", getImageUrl(product.productImage));


  return (
    <div className="mb-10 ">
    <Link href={`/gallery/product/${product.id}`}>
      <article className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-2xl hover:border-purple-200 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col h-full relative ">
        {/* Product Image & Badges */}
        <div className="relative h-64 bg-slate-100 overflow-hidden">
        
        <img
  src={getImageUrl(product.productImage)}
  alt={product.productTitle}
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
/>

          {/* Category Badge */}
          <span className="absolute top-3.5 left-3.5 bg-slate-900/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-sm">
            {categoryName}
          </span>

          {/* Condition Tag */}
          <span className="absolute top-3.5 right-3.5 bg-white/90 backdrop-blur-md text-purple-700 text-[11px] px-3 py-1 rounded-full font-bold shadow-sm border border-purple-100">
            {product.productCondition || "New"}
          </span>
        </div>

        {/* Product Details */}
        <div className="p-6 flex flex-col flex-1 justify-between bg-white">
          <div>
            <h2 className="font-extrabold text-lg line-clamp-1 text-slate-900 group-hover:text-purple-600 transition-colors">
              {product.productTitle}
            </h2>

            <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
              {product.productDescription }
            </p>
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Price</span>
              <span className="text-2xl font-black text-purple-600">
                ₹{product.productPrice}
              </span>
            </div>

            <span className="bg-slate-900 group-hover:bg-purple-600 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md group-hover:shadow-purple-200">
              View Product →
            </span>
          </div>
        </div>
      </article>
    </Link>
    </div>
  );
}

/* ─── Gallery Main Page ─── */
export default function GalleryPage() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [isLiveApi, setIsLiveApi] = useState(false);

  useEffect(() => {
    fetchLiveProducts();
  }, []);

  async function fetchLiveProducts() {
    const urlsToTry = [
      `${API_BASE_URL}/api/products/`,
      "/api/products/",
      "http://127.0.0.1:8000/api/products/",
      "http://localhost:8000/api/products/",
    ];

    if (typeof window !== "undefined" && window.location.hostname) {
      const hostUrl = `http://${window.location.hostname}:8000/api/products/`;
      if (!urlsToTry.includes(hostUrl)) {
        urlsToTry.push(hostUrl);
      }
    }

    for (const url of urlsToTry) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data?.results;
          if (Array.isArray(items) && items.length > 0) {
            setProducts(items);
            setIsLiveApi(true);
            return;
          } else if (res.ok) {
            setIsLiveApi(true);
            return;
          }
        }
      } catch {
        // Try next candidate URL
      }
    }

    setIsLiveApi(false);
  }

  // Extract unique category names safely
  const categories = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((p) => getCategoryName(p.category))
          .filter(Boolean)
      )
    );
  }, [products]);

  // Extract available conditions
  const conditions = useMemo(() => {
    const condSet = new Set(
      products.map((p) => p.productCondition).filter(Boolean)
    );
    if (condSet.size === 0) {
      return ["New", "Like New", "Used", "Vintage"];
    }
    return Array.from(condSet);
  }, [products]);

  // Combined Search, Filtering, and Sorting logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const title = (p.productTitle || p.title || "").toLowerCase();
        const desc = (p.productDescription || p.description || "").toLowerCase();
        const cat = getCategoryName(p.category).toLowerCase();
        const cond = (p.productCondition || "").toLowerCase();
        return title.includes(q) || desc.includes(q) || cat.includes(q) || cond.includes(q);
      });
    }

    // 2. Category Filter
    if (selectedCategory.toLowerCase() !== "all") {
      result = result.filter(
        (p) => getCategoryName(p.category).toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 3. Price Filter
    if (priceRange !== "all") {
      result = result.filter((p) => {
        const price = parseFloat(p.productPrice || p.price || 0);
        if (priceRange === "under500") return price < 500;
        if (priceRange === "500to1000") return price >= 500 && price <= 1000;
        if (priceRange === "1000to2000") return price > 1000 && price <= 2000;
        if (priceRange === "above2000") return price > 2000;
        return true;
      });
    }

    // 4. Condition Filter
    if (selectedCondition !== "all") {
      result = result.filter(
        (p) => (p.productCondition || "New").toLowerCase() === selectedCondition.toLowerCase()
      );
    }

    // 5. Sort By
    if (sortBy === "price-low") {
      result.sort((a, b) => parseFloat(a.productPrice || 0) - parseFloat(b.productPrice || 0));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => parseFloat(b.productPrice || 0) - parseFloat(a.productPrice || 0));
    } else if (sortBy === "name-az") {
      result.sort((a, b) => (a.productTitle || "").localeCompare(b.productTitle || ""));
    }

    return result;
  }, [products, searchQuery, selectedCategory, priceRange, selectedCondition, sortBy]);

  // Check if any filter is active to show Reset button
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "All" ||
    priceRange !== "all" ||
    selectedCondition !== "all" ||
    sortBy !== "default";

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setPriceRange("all");
    setSelectedCondition("all");
    setSortBy("default");
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50/70 ">
        <div className="max-w-7xl ">

        <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -right-28 -top-36 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -bottom-48 left-1/3 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 pb-4 pt-10">
        <div className="mb-8 ">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold uppercase tracking-wider mb-3">
              🛍️ Thrift Store Marketplace
            </div>
            <h1 className="text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl">
              Explore All Products
            </h1>
            <p className="text-slate-500 mt-2 text-base max-w-2xl">
              Discover unique handpicked items, vintage fashion, handcrafted jewelry, and home decor from top sellers.
            </p>
          </div>
        </div>
      </section>
          {/* Header Banner */}
          

          {/* ─── Integrated 2-Column Layout: Categories (Left) & Search + Grid (Right) ─── */}
          <div className="flex flex-col lg:flex-row gap-8 items-start mt-5">
            
            {/* Left Sidebar: Categories (Aligned starting from top left!) */}
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Right Main Area: Compact Search & Filter Bar + Product Grid */}
            <div className="flex-1 min-w-0 w-full space-y-6">
              
              {/* Compact Search & Filter Control Card (Aligned right above 1st product card!) */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                  
                  {/* Compact Search Input */}
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      🔍
                    </span>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-11 pl-10 pr-9 rounded-2xl bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white text-xs sm:text-sm text-slate-900 font-medium transition-all outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs bg-slate-200 hover:bg-slate-300 w-5 h-5 rounded-full flex items-center justify-center transition"
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Filter Dropdowns - Clean & Compact Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:border-purple-500 focus:bg-white transition outline-none cursor-pointer"
                    >
                      <option value="all">💰 All Prices</option>
                      <option value="under500">Under ₹500</option>
                      <option value="500to1000">₹500 – ₹1,000</option>
                      <option value="1000to2000">₹1,000 – ₹2,000</option>
                      <option value="above2000">Above ₹2,000</option>
                    </select>

                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:border-purple-500 focus:bg-white transition outline-none cursor-pointer"
                    >
                      <option value="all">✨ All Conditions</option>
                      {conditions.map((cond) => (
                        <option key={cond} value={cond}>
                          {cond}
                        </option>
                      ))}
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:border-purple-500 focus:bg-white transition outline-none cursor-pointer"
                    >
                      <option value="default">🔃 Sort: Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name-az">Name: A to Z</option>
                    </select>

                    {hasActiveFilters && (
                      <button
                        onClick={resetAllFilters}
                        className="h-11 px-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-extrabold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>↺</span> Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Showing Result Counter Header */}
              <div className="flex items-center justify-between px-1">
                <p className="text-xs sm:text-sm font-bold text-slate-500">
                  Showing <span className="text-purple-600 font-extrabold text-base">{filteredProducts.length}</span> {filteredProducts.length === 1 ? "product" : "products"}
                  {selectedCategory !== "All" && <span> in <span className="text-slate-900 font-bold">{selectedCategory}</span></span>}
                  {searchQuery && <span> matching "<span className="text-slate-900 font-bold">{searchQuery}</span>"</span>}
                </p>
              </div>

              {/* Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="mb-10  mr-5">
                <div className="text-center py-20 px-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-3xl mb-4">
                    🔍
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No Products Found</h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-md">
                    We couldn't find any products matching your current search or filter criteria.
                  </p>
                  <button
                    onClick={resetAllFilters}
                    className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
