"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/layout/Navbar";

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
            ← Back to Gallery
          </Link>
        </div>
      </>
    );
  }

  const categoryName = getCategoryName(product.category);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/gallery"
            className="text-purple-600 font-semibold hover:underline"
          >
            ← Back to Gallery
          </Link>

          <div className="bg-white rounded-3xl shadow-lg mt-6 overflow-hidden grid md:grid-cols-2">
            {/* IMAGE */}
            <div>
              <img
                src={product.productImage}
                alt={product.productTitle}
                className="w-full h-full object-cover min-h-[350px]"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600";
                }}
              />
            </div>

            {/* DETAILS */}
            <div className="p-8 flex flex-col">
              <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full w-fit text-sm mb-4 font-medium">
                {categoryName}
              </span>

              <div className="flex justify-between items-start">
                <h1 className="text-4xl font-bold text-gray-900">
                  {product.productTitle}
                </h1>

                <button
                  type="button"
                  onClick={toggleFavorite}
                  className="text-3xl transition hover:scale-110 ml-4 shrink-0 cursor-pointer"
                >
                  {favorite ? "❤️" : "🤍"}
                </button>
              </div>

              <p className="text-3xl font-bold text-purple-600 mt-5">
                ₹{product.productPrice}
              </p>

              <div className="mt-6 space-y-3 text-gray-800">
                <p>
                  <span className="font-semibold">Condition:</span>{" "}
                  {product.productCondition || "New"}
                </p>

                <p>
                  <span className="font-semibold">Size:</span>{" "}
                  {product.productSize || "N/A"}
                </p>

                <p>
                  <span className="font-semibold">Stock:</span>{" "}
                  {product.productStock}
                </p>

                {product.vendor && (
                  <p>
                    <span className="font-semibold">Vendor:</span>{" "}
                    {typeof product.vendor === "object"
                      ? product.vendor?.business_name || product.vendor?.name
                      : product.vendor}
                  </p>
                )}
              </div>

              <div className="mt-8">
                <h2 className="font-bold text-xl mb-2 text-gray-900">
                  Description:
                </h2>

                <p className="text-gray-600 leading-7">
                  {product.productDescription}
                </p>
              </div>

              <a
                href="https://www.instagram.com/instabazaar.official/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 w-full text-center bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white rounded-2xl py-4 font-bold text-lg hover:scale-[1.02] transition duration-200 shadow-lg cursor-pointer flex items-center justify-center gap-2.5"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>DM on Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
