"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/layout/Navbar";
// import { useFavorites } from "@/context/FavoritesContext";
import { getPublicVendorBySlug } from "@/lib/vendorApi";
import { getVendorStoreData } from "@/app/data/vendorStoreData";

// Fallback vendor images/emojis by category
const categoryEmojis = {
  "Fashion & Accessories": "👗",
  "Vintage & Retro": "📻",
  "Thrift & Pre-loved": "♻️",
  Handmade: "🧶",
  Fashion: "👗",
  "Home Decor": "🏺",
  Jewellery: "💍",
  Art: "🎨",
  Food: "🍫",
  Candles: "🕯️",
  Electronics: "📱",
  Books: "📚",
  Music: "🎵",
  Accessories: "👜",
};

// Condition badge colors
const conditionStyles = {
  new: "bg-emerald-50 text-emerald-700",
  refurbished: "bg-amber-50 text-amber-700",
  used: "bg-blue-50 text-blue-700",
};

export default function VendorDetailPage() {
  const { slug } = useParams();
  // const { isFavorite, toggleFavorite } = useFavorites();
  const [vendor, setVendor] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVendor() {
      try {
        // Try API first
        const vendorData = await getPublicVendorBySlug(slug);

        // Check for product_count — if 0 or missing, use fallback
        if (!vendorData.product_count || vendorData.product_count === 0) {
          // Check mock data for this slug
          const mockStore = getVendorStoreData(slug);
          if (mockStore) {
            vendorData.product_count = mockStore.products.length;
            vendorData.category_name = mockStore.category;
            setStoreData(mockStore);
          } else {
            vendorData.category_name = "General Store";
          }
        }

        setVendor(vendorData);
      } catch (loadError) {
        // API failed — try mock data as fallback
        const mockStore = getVendorStoreData(slug);
        if (mockStore) {
          const fallbackVendor = {
            business_name: slug
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" "),
            store_slug: slug,
            bio: `Discover amazing products from ${slug
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")}. Browse our curated collection of unique items.`,
            location: "India",
            follower_count: "1.2K",
            product_count: mockStore.products.length,
            verification_status: "verified",
            category_name: mockStore.category,
            logo_url: null,
          };
          setVendor(fallbackVendor);
          setStoreData(mockStore);
        } else {
          setError(loadError.message || "Could not load vendor data.");
        }
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadVendor();
  }, [slug]);

  const getCategoryEmoji = (name) => {
    return categoryEmojis[name] || "🏪";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f7fb]">
        <Navbar />
        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="animate-pulse">
            <div className="mx-auto h-20 w-20 rounded-full bg-purple-200" />
            <div className="mx-auto mt-6 h-6 w-48 rounded bg-purple-200" />
            <div className="mx-auto mt-3 h-4 w-72 rounded bg-gray-200" />
            <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-gray-100" />
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (error && !vendor) {
    return (
      <main className="min-h-screen bg-[#f5f7fb]">
        <Navbar />
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="text-6xl mb-6">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Vendor not found</h2>
          <p className="text-gray-500 mb-8">{error}</p>
          <Link href="/vendors" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-lg hover:scale-105 transition">
            ← Back to Vendors
          </Link>
        </section>
      </main>
    );
  }

  // Determine products to display
  const products = vendor?.products || storeData?.products || [];
  const categoryName = vendor?.category_name || storeData?.category || "Store";

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <Navbar />

      {/* Vendor Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Link href="/vendors" className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-800 transition mb-6">
            ← Back to vendors
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 text-4xl shadow-md">
                {vendor.logo_url ? (
                  <img src={vendor.logo_url} alt={vendor.business_name} className="h-full w-full object-cover" />
                ) : (
                  getCategoryEmoji(categoryName)
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                  {vendor.business_name}
                </h1>
                {vendor.verification_status === "verified" && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                    ✓ Verified
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-4 py-1.5 text-sm font-semibold text-purple-700 border border-purple-200">
                  {getCategoryEmoji(categoryName)} {categoryName}
                </span>
                {vendor.location && (
                  <span className="text-sm text-gray-500">📍 {vendor.location}</span>
                )}
              </div>

              {vendor.bio && (
                <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">{vendor.bio}</p>
              )}

              <div className="flex items-center gap-6 mt-5 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-lg">📸</span>
                  <span className="font-semibold text-gray-800">{vendor.follower_count}</span>
                  <span>followers</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-lg">🛍️</span>
                  <span className="font-semibold text-gray-800">{vendor.product_count || products.length}</span>
                  <span>products</span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-600">
              {categoryName}
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              Products ({products.length})
            </h2>
          </div>
          {products.length > 0 && (
            <span className="text-sm text-gray-400">
              Sorted by latest
            </span>
          )}
        </div>

        {/* Product Grid or Empty State */}
        {products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Product Image */}
                <div className="relative h-52 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center text-6xl overflow-hidden">
                  <span className="group-hover:scale-110 transition-transform duration-500">
                    {product.productImage}
                  </span>
                  {/* Condition Badge */}
                  <span
                    className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold border ${
                      conditionStyles[product.productCondition] ||
                      "bg-gray-50 text-gray-600"
                    }`}
                  >
                    {product.productCondition === "new"
                      ? "🆕 New"
                      : product.productCondition === "refurbished"
                        ? "🔄 Refurbished"
                        : "📦 Pre-loved"}
                  </span>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <span className="inline-block rounded-full bg-purple-50 px-3 py-0.5 text-xs font-medium text-purple-600 mb-2">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2">
                    {product.productTitle}
                  </h3>

                  {/* Rating placeholder */}
                  <div className="flex items-center gap-1 text-amber-400 text-sm mb-3">
                    <span>★★★★★</span>
                    <span className="text-gray-400 text-xs ml-1">(24)</span>
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                    {product.productDescription}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-extrabold text-gray-900">
                        ₹{parseInt(product.productPrice).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        window.open(
                          `https://instagram.com/${vendor.instagram_handle || slug}`,
                          "_blank"
                        )
                      }
                      className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white px-4 py-2 text-xs font-semibold shadow-md hover:scale-105 transition"
                    >
                      📸 View on IG
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No products yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              This vendor hasn&apos;t listed any products yet. Check back soon for new arrivals!
            </p>
          </div>
        )}

        {/* Safety Notice */}
        <div className="mt-12 rounded-2xl bg-amber-50 border border-amber-200 p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-bold text-amber-800 text-sm">
                Important Safety Notice
              </h4>
              <p className="text-sm text-amber-700 mt-1">
                InstaBazaar is a discovery platform. All purchases are made directly
                via Instagram. We do not process payments or handle transactions.
                Please read our{" "}
                <Link href="/warning" className="underline font-semibold">
                  Safety Warning
                </Link>{" "}
                page before making any purchase.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
