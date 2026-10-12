"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import API_BASE_URL from "@/lib/api";

// Helper to pick N random items from an array
function getRandomItems(array, n = 4) {
  if (!array || array.length === 0) return [];
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

export default function FeaturedProducts() {
  const [featured, setFeatured] = useState([]);

  async function fetchLiveProducts() {
    const urlsToTry = [
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
          if (Array.isArray(data) && data.length > 0) {
            setFeatured(getRandomItems(data, 4));
            return;
          }
        }
      } catch {
        // Try next candidate URL
      }
    }

    setFeatured([]);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => fetchLiveProducts(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="bg-[#081225] max-w-8xl mx-auto px-6 py-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Featured Products</h2>
          <p className="text-sm text-gray-500 mt-1">Handpicked collection from active thrift stores</p>
        </div>

        <Link
          href="/gallery"
          className="text-[#F5AE30] font-bold hover:text-purple-700 transition flex items-center gap-1"
        >
          View All →
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featured.map((product) => {
          const image = product.productImage || product.image;
          const imageSrc = image?.startsWith("http")
            ? image
            : `${API_BASE_URL}${image?.startsWith("/") ? "" : "/"}${image || ""}`;
          const title = product.productTitle || product.title;
          const price = product.productPrice || product.price;
          const categoryName =
            typeof product.category === "object"
              ? product.category?.categoryName || "Featured"
              : product.category || "Featured";

          return (
            <Link key={product.id} href={`/gallery/product/${product.id}`}>
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full">
                <div className="h-56 bg-gray-100 relative overflow-hidden">
                  <img
                    src={imageSrc}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    {categoryName}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1 text-base">{title}</h3>
                    {product.productCondition && (
                      <p className="text-xs text-gray-400 mt-1">Condition: {product.productCondition}</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <p className="text-purple-600 font-extrabold text-xl">₹{price}</p>
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl hover:bg-purple-100 transition">
                      View Details
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
