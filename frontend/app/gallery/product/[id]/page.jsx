"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/layout/Navbar";
import Footer from "../../../components/home/Footer";
import API_BASE_URL from "@/lib/api";
import { getAllProducts, getVendorStoreData } from "../../../data/vendorStoreData";

// Helper function to safely extract string name from category (string or object)
function getCategoryName(category) {
  if (!category) return "Handmade";
  if (typeof category === "string") return category.trim();
  if (typeof category === "object") {
    return (category.categoryName || category.name || "Handmade").trim();
  }
  return String(category).trim();
}

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    productTitle: "Handmade Cotton Kurta",
    productDescription: "Beautiful handloom cotton kurta with traditional embroidery. Perfect for casual and festive occasions.",
    productPrice: "1299.00",
    productImage: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600",
    productStock: 15,
    productSize: "M",
    productCondition: "New",
    category: "Clothing",
    vendor: "KnotCraft Studio",
    instagram_handle: "knotcraft.official",
    followers: "14.2k",
  },
  {
    id: 2,
    productTitle: "Silver Oxidized Jhumkas",
    productDescription: "Stunning oxidized silver jhumka earrings. Lightweight and comfortable for everyday wear.",
    productPrice: "499.00",
    productImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600",
    productStock: 30,
    productSize: "Free Size",
    productCondition: "New",
    category: "Accessories",
    vendor: "Aura Jewels",
    instagram_handle: "aurajewels.in",
    followers: "8.9k",
  },
  {
    id: 3,
    productTitle: "Macrame Wall Hanging",
    productDescription: "A beautiful handwoven macramé wall hanging made with 100% cotton rope. Perfect for adding warmth to any room. Each piece is unique and made to order.",
    productPrice: "649.00",
    productOriginalPrice: "899.00",
    productImage: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600",
    productStock: 8,
    productSize: "Standard",
    productCondition: "New",
    category: "Handmade",
    vendor: "TheKnotCo",
    instagram_handle: "theknotco",
    followers: "14.2k",
  },
  {
    id: 4,
    productTitle: "Block Print Tote Bag",
    productDescription: "Eco-friendly cotton tote bag with traditional Rajasthani block print design.",
    productPrice: "349.00",
    productImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600",
    productStock: 25,
    productSize: "Large",
    productCondition: "New",
    category: "Accessories",
    vendor: "Jaipur Prints",
    instagram_handle: "jaipurprints.co",
    followers: "22.5k",
  },
  {
    id: 5,
    productTitle: "Indigo Dyed Scarf",
    productDescription: "Natural indigo dyed cotton scarf. Handwoven by artisans from Bagru, Rajasthan.",
    productPrice: "599.00",
    productImage: "https://images.unsplash.com/photo-1601924638867-3a6de6b7a500?w=600",
    productStock: 12,
    productSize: "One Size",
    productCondition: "New",
    category: "Clothing",
    vendor: "Bagru Indigo",
    instagram_handle: "bagruindigo",
    followers: "11.1k",
  },
  {
    id: 6,
    productTitle: "Ceramic Plant Pot Set",
    productDescription: "Set of 3 hand-painted ceramic pots. Perfect for indoor plants and succulents.",
    productPrice: "749.00",
    productImage: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600",
    productStock: 10,
    productSize: "Medium",
    productCondition: "New",
    category: "Home Decor",
    vendor: "Clay & Co",
    instagram_handle: "clayandco",
    followers: "5.4k",
  },
];

const STORE_PRODUCTS = typeof getAllProducts === "function" ? getAllProducts() : [];

export default function ProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const vendorSlug = searchParams?.get("vendor");
  const vendorProducts = vendorSlug && typeof getVendorStoreData === "function"
    ? getVendorStoreData(vendorSlug)?.products || []
    : [];

  const initialProduct =
    vendorProducts.find((p) => String(p.id) === String(params?.id)) ||
    FALLBACK_PRODUCTS.find((p) => String(p.id) === String(params?.id)) ||
    STORE_PRODUCTS.find((p) => String(p.id) === String(params?.id)) ||
    null;

  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [favorite, setFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!vendorSlug) {
      fetchLiveProduct();
    }
  }, [params?.id, vendorSlug]);

  useEffect(() => {
    if (product) {
      const favorites = JSON.parse(
        localStorage.getItem("galleryFavorites") || "[]"
      );
      setFavorite(favorites.includes(product.id));
    }
  }, [product]);

  async function fetchLiveProduct() {
    const urlsToTry = [
      `/api/products/${params?.id}/`,
      `${API_BASE_URL}/api/products/${params?.id}/`,
      `http://127.0.0.1:8000/api/products/${params?.id}/`,
    ];

    for (const url of urlsToTry) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setLoading(false);
          return;
        }
      } catch {
        // Try next candidate URL
      }
    }

    setLoading(false);
  }

  function toggleFavorite() {
    if (!product) return;
    let favorites = JSON.parse(
      localStorage.getItem("galleryFavorites") || "[]"
    );

    if (favorites.includes(product.id)) {
      favorites = favorites.filter((id) => id !== product.id);
      setFavorite(false);
    } else {
      favorites.push(product.id);
      setFavorite(true);
    }

    localStorage.setItem("galleryFavorites", JSON.stringify(favorites));
  }

  /* Loading State */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
        <Navbar />
        <div className="flex flex-col justify-center items-center gap-4 py-24">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
        <Navbar />
        <div className="flex flex-col justify-center items-center gap-4 px-6 text-center py-24">
          <p className="text-red-600 font-bold text-xl">Product #{params?.id} not found</p>
          <Link
            href="/gallery"
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
          >
            ← Back to Gallery
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const title = product.productTitle || product.title || "Product";
  const categoryName = getCategoryName(product.category);
  const currentPrice = parseFloat(product.productPrice || product.price || "649");
  const originalPrice = parseFloat(
    product.productOriginalPrice ||
    product.originalPrice ||
    (currentPrice ? (currentPrice + 250).toFixed(0) : "899")
  );
  const savings = Math.max(0, originalPrice - currentPrice);

  // Normalize image list or provide clean fallbacks
  const productImages = [
    product.productImage || product.image,
    ...(Array.isArray(product.productImages) ? product.productImages : []),
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter((img, idx, arr) => typeof img === "string" && img.trim() && arr.indexOf(img) === idx);

  const displayImages =
    productImages.length > 0
      ? productImages
      : ["https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600"];

  const mainImageUrl = displayImages[activeImageIndex] || displayImages[0];

  const vendorName =
    typeof product.vendor === "object"
      ? product.vendor?.business_name || product.vendor?.name || "TheKnotCo"
      : product.vendor || "TheKnotCo";

  const instagramHandle =
    product.instagram_handle ||
    (typeof product.vendor === "object" && product.vendor?.instagram_handle) ||
    vendorName.toLowerCase().replace(/\s+/g, "");

  const vendorFollowers = product.followers || "14.2k";

  const tags = [
    categoryName.toLowerCase(),
    "home",
    "handmade",
  ].filter((t, i, arr) => arr.indexOf(t) === i);

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-slate-800 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full flex-1">
        {/* Breadcrumb Header */}
        <nav className="text-xs sm:text-sm text-slate-500 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-purple-600 transition">Home</Link>
          <span>/</span>
          <Link href="/gallery" className="hover:text-purple-600 transition">{categoryName}</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-xs sm:max-w-md">{title}</span>
        </nav>

        {/* Product Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Image Preview + Thumbnails */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* Main Image Box with soft curved corners */}
            <div className="w-full aspect-square max-w-[500px] bg-[#F4EFE6]/60 rounded-3xl p-6 sm:p-8 flex items-center justify-center border border-stone-200/70 shadow-sm relative overflow-hidden">
              <img
                src={mainImageUrl}
                alt={title}
                className="w-full h-full object-contain mix-blend-multiply drop-shadow-md transition-all duration-300 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600";
                }}
              />
            </div>

            {/* Thumbnails Row */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 flex-wrap">
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#F4EFE6]/70 border-2 flex items-center justify-center p-2 cursor-pointer transition-all ${
                    activeImageIndex === idx
                      ? "border-orange-500 shadow-md ring-2 ring-orange-200"
                      : "border-stone-200 hover:border-stone-300 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block mb-1">
                Best Seller
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                {title}
              </h1>

              {/* Rating & Stock */}
              <div className="flex items-center gap-3 mt-2.5 text-xs sm:text-sm">
                <div className="flex items-center text-amber-500 font-bold">
                  <span></span>
                  <span className="text-slate-600 ml-1.5 font-semibold"></span>
                </div>
                <span className="text-emerald-700 font-bold bg-emerald-100/70 px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1">
                  
                </span>
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-orange-500">
                ₹{currentPrice.toFixed(0)}
              </span>
              {originalPrice > currentPrice && (
                <span className="text-lg sm:text-xl text-slate-400 line-through font-semibold">
                  ₹{originalPrice.toFixed(0)}
                </span>
              )}
              {savings > 0 && (
                <span className="text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Save ₹{savings.toFixed(0)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {product.productDescription ||
                "A beautiful handcrafted find curated from Instagram creators. Made with premium quality materials, perfect for adding authentic charm to your collection."}
            </p>

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-stone-100/80 hover:bg-stone-200 text-slate-600 text-xs font-semibold rounded-full border border-stone-200/80 transition"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Quantity Stepper 
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-700">Quantity</span>
              <div className="inline-flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-slate-600 hover:bg-stone-100 transition font-bold text-sm"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs sm:text-sm font-bold text-slate-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-stone-100 transition font-bold text-sm"
                >
                  +
                </button>
              </div>
            </div>*/}

            {/* CTA Buttons: Instagram DM + Save */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://www.instagram.com/${instagramHandle}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial sm:px-8 py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-center"
              >
                <span>🛍️</span>
                <span>View on Instagram</span>
              </a>

              <button
                type="button"
                onClick={toggleFavorite}
                className="px-5 py-3.5 rounded-2xl border border-stone-300 bg-white hover:bg-stone-50 font-bold text-sm text-slate-700 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>{favorite ? "❤️" : "🤍"}</span>
                <span>{favorite ? "Saved" : "Save"}</span>
              </button>
            </div>

            {/* Vendor Mini Profile Card */}
            <div className="p-4 rounded-2xl border border-stone-200/80 bg-white shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
                  {vendorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">{vendorName}</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200">
                      ✓ Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {vendorFollowers} followers • {categoryName}
                  </p>
                  <p className="text-[11px] text-purple-600 font-medium">@{instagramHandle}</p>
                </div>
              </div>
              <span className="text-stone-400 text-lg">›</span>
            </div>

            {/* Specs Table */}
            <div className="border-t border-stone-200/80 pt-4 text-xs sm:text-sm space-y-2.5">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Category</span>
                <span className="font-semibold text-slate-800">{categoryName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Vendor</span>
                <span className="font-semibold text-slate-800">{vendorName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Purchase via</span>
                <span className="font-semibold text-slate-800">Instagram DM</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Returns</span>
                <span className="font-semibold text-slate-800">Contact vendor</span>
              </div>
            </div>

            {/* Safety Tips Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
              <span className="text-amber-600 font-bold">⚠️</span>
              <p>
                InstaBazaar is a discovery platform. Purchases are made directly on Instagram.{" "}
              
              </p>
            </div>
          </div>
        </div>

        {/* "More from [Vendor]" section */}
        <section className="mt-16 pt-8 border-t border-stone-200/80">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            More from {vendorName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            No other products from this vendor yet.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
