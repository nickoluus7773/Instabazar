"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/layout/Navbar";
import Footer from "../../../components/home/Footer";

// Helper function to safely extract string name from category (string or object)
function getCategoryName(category) {
  if (!category) return "Uncategorized";
  if (typeof category === "string") return category.trim();
  if (typeof category === "object") {
    return (category.categoryName || category.name || "Other").trim();
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
    vendor: "Demo Store",
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
    vendor: "Demo Store",
  },
  {
    id: 3,
    productTitle: "Macrame Wall Hanging",
    productDescription: "Hand-knotted macrame wall hanging made with 100% cotton rope. Adds a boho touch to any room.",
    productPrice: "899.00",
    productImage: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600",
    productStock: 8,
    productSize: "Standard",
    productCondition: "New",
    category: "Home Decor",
    vendor: "Demo Store",
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
    vendor: "Demo Store",
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
    vendor: "Demo Store",
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
    vendor: "Demo Store",
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  
  // Find matching initial fallback item if exists, otherwise null to wait for live API
  const initialProduct =
    FALLBACK_PRODUCTS.find((p) => String(p.id) === String(params.id)) || null;

  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [favorite, setFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    fetchLiveProduct();
  }, [params.id]);

  useEffect(() => {
    if (product) {
      const favorites = JSON.parse(
        localStorage.getItem("galleryFavorites") || "[]"
      );
      setFavorite(favorites.includes(product.id));
    }
  }, [product]);

  async function fetchLiveProduct() {
    // List candidate URLs: relative Next.js proxy route first, then direct backend URLs
    const urlsToTry = [
      `/api/products/${params.id}/`,
      `http://127.0.0.1:8000/api/products/${params.id}/`,
      `http://localhost:8000/api/products/${params.id}/`,
    ];

    if (typeof window !== "undefined" && window.location.hostname) {
      const hostUrl = `http://${window.location.hostname}:8000/api/products/${params.id}/`;
      if (!urlsToTry.includes(hostUrl)) {
        urlsToTry.push(hostUrl);
      }
    }

    for (const url of urlsToTry) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setLoading(false);
          return; // Successfully fetched exact product details from live Django API
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
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading product details...</p>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center gap-4 px-6 text-center">
          <p className="text-red-600 font-bold text-xl">Product #{params.id} not found</p>
          <Link
            href="/gallery"
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
          >
            ΓåÉ Back to Gallery
          </Link>
        </div>
      </>
    );
  }

  const categoryName = getCategoryName(product.category);
  const productImages = [
    product.productImage,
    ...(Array.isArray(product.productImages) ? product.productImages : []),
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter((image, index, images) =>
    typeof image === "string" && image.trim() && images.indexOf(image) === index
  );
  const mainImage = productImages.includes(activeImage)
    ? activeImage
    : productImages[0];
  const stockCount = Number(product.productStock ?? 0);
  const isAvailable = stockCount > 0;
  const savingsAmount = Number(product.savingsAmount ?? product.savings_amount ?? 250);
  const productTags = [categoryName, product.productCondition, product.productSize]
    .filter(Boolean)
    .map((tag) => `#${String(tag).toLowerCase().replace(/\s+/g, "")}`);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-purple-700"
          >
            <span className="text-lg">ΓåÉ</span> Back to Gallery
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-12 xl:gap-16">
            {/* IMAGE */}
            <section className="min-w-0">
              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <span className="absolute left-5 top-5 z-10 rounded-full bg-slate-900/80 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur">{categoryName}</span>
                <span className="absolute right-5 top-5 z-10 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold text-purple-700 shadow-sm backdrop-blur">{product.productCondition || "New"}</span>
                <div className="aspect-square bg-slate-100 sm:aspect-[1.06]">
              <img
                src={mainImage}
                alt={product.productTitle}
                  className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600";
                }}
              />
                </div>
              </div>
              {productImages.length > 1 && (
                <>
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                    {productImages.map((image, index) => (
                      <button key={image} type="button" onClick={() => setActiveImage(image)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-white p-1 transition sm:h-24 sm:w-24 ${mainImage === image ? "border-purple-600 shadow-md shadow-purple-100" : "border-transparent hover:border-purple-200"}`} aria-label={`View product image ${index + 1}`}>
                        <img src={image} alt="" className="h-full w-full rounded-xl object-cover" />
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs font-medium text-slate-400">Select an image to view more product details.</p>
                </>
              )}
            </section>

            {/* DETAILS */}
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:self-start">

              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-purple-600">Curated find</p>
                  <h1 className="mt-2 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">{product.productTitle}</h1>
                </div>

                <button
                  type="button"
                  onClick={toggleFavorite}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl shadow-sm transition hover:scale-105 hover:border-pink-200"
                  aria-label={favorite ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {favorite ? "Γ¥ñ∩╕Å" : "≡ƒñì"}
                </button>
              </div>

              <p className="mt-5 text-4xl font-black text-purple-700">
                Γé╣{product.productPrice}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
                  <span className={`h-2 w-2 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-rose-500"}`} />
                  {isAvailable ? "In stock" : "Out of stock"}
                </span>
                {isAvailable && <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">Only {stockCount} left</span>}
                {Number.isFinite(savingsAmount) && savingsAmount > 0 && <span className="rounded-full bg-pink-50 px-3 py-1.5 text-xs font-bold text-pink-700">Save Γé╣{savingsAmount}</span>}
                <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700">Direct from vendor</span>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3 border-y border-slate-100 py-5 text-sm">
                <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Condition</p><p className="mt-1 font-bold text-slate-800">{product.productCondition || "New"}</p></div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Size</p><p className="mt-1 font-bold text-slate-800">{product.productSize || "Not specified"}</p></div>
              </div>

              <div className="mt-7">
                <h2 className="text-lg font-black text-slate-900">About this product</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">{product.productDescription || "Ask the vendor for more details about this find."}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {productTags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">{tag}</span>)}
                </div>
              </div>

              {product.vendor && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-sm font-black text-white">{String(typeof product.vendor === "object" ? product.vendor?.business_name || product.vendor?.name || "V" : product.vendor).charAt(0).toUpperCase()}</div>
                  <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Listed by</p><p className="font-bold text-slate-800">{typeof product.vendor === "object" ? product.vendor?.business_name || product.vendor?.name : product.vendor}</p></div>
                </div>
              )}

              <a
                href="https://www.instagram.com/instabazaar.official/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 py-4 text-center text-base font-bold text-white shadow-lg transition duration-200 hover:scale-[1.02]"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>DM on Instagram</span>
              </a>
              <p className="mt-3 text-center text-xs leading-5 text-slate-400">You will continue your purchase directly with the vendor on Instagram.</p>
            </section>
          </div>

          <section className="mt-10 grid gap-5 md:grid-cols-3">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-xl">Γ£ª</div>
              <h2 className="mt-5 text-lg font-black text-slate-900">Why it stands out</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">A one-of-a-kind discovery selected from an independent vendor catalogΓÇönot a mass-market listing.</p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-xl">Γ£ô</div>
              <h2 className="mt-5 text-lg font-black text-slate-900">Before you message</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Confirm availability, sizing, condition, delivery and final price directly with the vendor before purchasing.</p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-xl">ΓÖí</div>
              <h2 className="mt-5 text-lg font-black text-slate-900">Love this find?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Save it to your wishlist, then return when you are ready to connect with the seller.</p>
              <button type="button" onClick={toggleFavorite} className="mt-4 text-sm font-bold text-purple-700 hover:text-purple-900">{favorite ? "Saved to wishlist" : "Save for later"} ΓåÆ</button>
            </article>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}