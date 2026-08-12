"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/layout/Navbar";

// Helper function to safely extract string name from category (string or object)
function getCategoryName(category) {
  if (!category) return "Uncategorized";
  if (typeof category === "string") return category.trim();
  if (typeof category === "object") {
    return (category.categoryName || category.name || "Other").trim();
  }
  return String(category).trim();
}

// Initial fallback catalog matching the database structure
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
  },
];

/* ─── Category Sidebar Component ─── */
function CategorySidebar({ categories, selectedCategory, onSelectCategory }) {
  return (
    <aside className="w-full lg:w-60 shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border p-5 sticky top-24">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Categories</h2>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onSelectCategory("All")}
            className={`w-full text-left px-4 py-3 rounded-xl transition cursor-pointer font-medium text-sm flex items-center justify-between ${
              selectedCategory.toLowerCase() === "all"
                ? "bg-purple-600 text-white shadow-sm font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span>All Products</span>
          </button>

          {categories.map((cat) => {
            const isSelected =
              selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`w-full text-left px-4 py-3 rounded-xl transition cursor-pointer font-medium text-sm flex items-center justify-between ${
                  isSelected
                    ? "bg-purple-600 text-white shadow-sm font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{cat}</span>
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

  return (
    <Link href={`/gallery/product/${product.id}`}>
      <article className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full">
        <div className="relative">
          <img
            src={product.productImage}
            alt={product.productTitle}
            className="w-full h-64 object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600";
            }}
          />

          <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs px-3 py-1 rounded-lg font-semibold shadow">
            {categoryName}
          </span>
        </div>

        <div className="p-5 flex flex-col flex-1 justify-between">
          <div>
            <h2 className="font-bold text-lg line-clamp-2 text-gray-900 mb-1">
              {product.productTitle}
            </h2>

            <p className="text-gray-500 text-xs">
              Condition: {product.productCondition || "New"}
            </p>
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
            <span className="text-2xl font-black text-purple-700">
              ₹{product.productPrice}
            </span>

            <span className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm">
              View Product
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ─── Gallery Main Page ─── */
export default function GalleryPage() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLiveApi, setIsLiveApi] = useState(false);

  useEffect(() => {
    fetchLiveProducts();
  }, []);

  async function fetchLiveProducts() {
    // List candidate URLs: relative Next.js proxy route first, then direct backend URLs
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
            setProducts(data);
            setIsLiveApi(true);
            return; // Successfully loaded live Django products
          }
        }
      } catch {
        // Try next candidate URL
      }
    }

    setIsLiveApi(false);
  }

  // Extract unique category names safely
  const categories = Array.from(
    new Set(
      products
        .map((p) => getCategoryName(p.category))
        .filter(Boolean)
    )
  );

  // Filter products based on selected category (case-insensitive)
  const filteredProducts =
    selectedCategory.toLowerCase() === "all"
      ? products
      : products.filter(
          (p) =>
            getCategoryName(p.category).toLowerCase() ===
            selectedCategory.toLowerCase()
        );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-6">

          {/* Backend Status Notice */}
          {!isLiveApi && (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 px-5 py-3 rounded-2xl mb-8 flex items-center justify-between text-sm shadow-sm">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>
                  <strong>Django Backend is not connected.</strong> Showing sample products. Make sure Django is running on port 8000 (`python manage.py runserver 127.0.0.1:8000`)!
                </span>
              </div>
              <button
                onClick={fetchLiveProducts}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
              >
                Connect Backend
              </button>
            </div>
          )}

          <h1 className="text-5xl font-bold mb-2 text-black">All Products</h1>

          <p className="text-gray-500 mb-8">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} {selectedCategory !== "All" && `in ${selectedCategory}`}
          </p>

          <div className="flex flex-col lg:flex-row gap-8">
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-gray-400 text-lg bg-white rounded-2xl border">
                  No products found in "{selectedCategory}".
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
