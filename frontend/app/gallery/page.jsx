  "use client";

  import { useEffect, useState, useMemo } from "react";
  import Link from "next/link";
  import Navbar from "../components/layout/Navbar";
  import Footer from "../components/home/Footer";
  import API_BASE_URL from "@/lib/api";
  import { getImageUrl } from "@/lib/imageHelper";

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

  /* ─── Product Card Component ─── */
  function ProductCard({ product }) {
    const categoryName = getCategoryName(product.category);
    const vendorName =
      typeof product.vendor === "string"
        ? product.vendor
        : product.vendor?.business_name || product.vendor?.name || "";

    return (
      <Link href={`/gallery/product/${product.id}`} className="group block h-full">
        <article className="h-full flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-purple-200">
          {/* Product Image Area */}
          <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
            <img
              src={getImageUrl(product.productImage)}
              alt={product.productTitle}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Category Pill */}
            <span className="absolute left-3.5 top-3.5 max-w-[70%] truncate rounded-full bg-slate-950/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white shadow-sm">
              {categoryName}
            </span>
            {/* Condition Badge */}
            {product.productCondition && (
              <span className="absolute right-3.5 top-3.5 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-800 shadow-sm border border-slate-200/60">
                {product.productCondition}
              </span>
            )}
          </div>

          {/* Card Content */}
          <div className="p-5 flex flex-col flex-1 justify-between gap-4">
            <div>
              {vendorName && (
                <p className="text-xs font-semibold text-purple-600 mb-1 line-clamp-1">
                  {vendorName}
                </p>
              )}
              <h2 className="line-clamp-2 text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors leading-snug">
                {product.productTitle}
              </h2>
              {product.productDescription && (
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {product.productDescription}
                </p>
              )}
            </div>

            <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Price</span>
                <span className="text-lg font-black text-slate-950">
                  ₹{Number(product.productPrice || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-xl bg-purple-50 group-hover:bg-purple-600 text-purple-700 group-hover:text-white px-3.5 py-2 text-xs font-bold transition-all shadow-xs">
                View <span>→</span>
              </span>
            </div>
          </div>
        </article>
      </Link>
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

        <main className="min-h-screen bg-[#FBFBFC]">
          {/* Header Banner */}
          <section className="relative overflow-hidden bg-slate-950 text-white">
            <div className="absolute -right-28 -top-36 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-48 left-1/3 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl pointer-events-none" />
            <div className="relative mx-auto max-w-7xl px-6 py-12 sm:py-16">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
                  <span>🛍️</span> Marketplace Directory
                </div>
                <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl text-white">
                  Explore Curated Finds
                </h1>
                <p className="text-slate-400 mt-3 text-base sm:text-lg max-w-2xl leading-relaxed">
                  Discover handpicked independent sellers, vintage streetwear, artisanal jewelry, handmade ceramics, and bespoke lifestyle products.
                </p>
              </div>
            </div>
          </section>

          {/* ─── Integrated 2-Column Layout with proper margins and padding ─── */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24">
            <div className="flex flex-col lg:flex-row gap-8 xl:gap-10 items-start">
              
              {/* Left Sidebar: Categories */}
              <CategorySidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />

              {/* Right Main Area */}
              <div className="flex-1 min-w-0 w-full space-y-6">
                
                {/* Search & Filter Control Card */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/80">
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        🔍
                      </span>
                      <input
                        type="text"
                        placeholder="Search products, brands, or categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 pl-10 pr-9 rounded-2xl bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white text-xs sm:text-sm text-slate-900 font-medium transition-all outline-none"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs bg-slate-200 hover:bg-slate-300 w-5 h-5 rounded-full flex items-center justify-center transition cursor-pointer"
                          title="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Filter Dropdowns */}
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
                  <p className="text-xs sm:text-sm font-semibold text-slate-500">
                    Showing <span className="text-purple-600 font-extrabold text-sm sm:text-base">{filteredProducts.length}</span> {filteredProducts.length === 1 ? "product" : "products"}
                    {selectedCategory !== "All" && <span> in <span className="text-slate-900 font-bold">{selectedCategory}</span></span>}
                    {searchQuery && <span> matching "<span className="text-slate-900 font-bold">{searchQuery}</span>"</span>}
                  </p>
                </div>

                {/* Product Grid with proper gap and responsive columns */}
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-20 px-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center">
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
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
