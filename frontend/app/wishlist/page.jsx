"use client";

import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import API_BASE_URL from "@/lib/api";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/home/Footer";
import Card from "../components/ui/Card";
import SectionContainer from "../components/ui/SectionContainer";
import SectionHeading from "../components/ui/SectionHeading";

export default function WishlistPage() {
  const { favoriteProducts, toggleFavorite } = useFavorites();

  function getImageUrl(image) {
    if (!image) return "/images/product-placeholder.svg";
    return image.startsWith("http") ? image : `${API_BASE_URL}${image}`;
  }

  function getCategoryName(category) {
    if (typeof category === "string") return category;
    return category?.categoryName || category?.name || "Product";
  }

  function getVendorName(vendor) {
    if (typeof vendor === "string") return vendor;
    return vendor?.business_name || vendor?.name || "Independent seller";
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-orange-50 via-pink-50 to-indigo-100">
      <Navbar />

      <SectionContainer
        padding="pt-24 pb-20"
        className="w-full flex-1 bg-transparent"
      >
        <SectionHeading
          badge="💜 Wishlist"
          title="Saved products"
          gradientText="for your next discovery"
          description="Keep track of the products and brands you want to revisit, compare, or revisit when you're ready to act."
        />

        {favoriteProducts.length === 0 ? (
          <div className="mx-auto max-w-3xl">
            <Card className="p-12 text-center shadow-[0_30px_80px_-40px_rgba(15,23,42,0.28)] sm:p-16">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 via-orange-50 to-yellow-100 text-pink-600 shadow-inner">
                <Heart className="h-9 w-9" fill="currentColor" strokeWidth={1.7} />
              </div>

              <h3 className="mt-8 text-3xl font-black text-slate-900 sm:text-4xl">
                Your wishlist is empty
              </h3>

              <p className="mt-4 text-lg leading-8 text-slate-600">
                Discover standout products from creator-led brands and save the pieces you want to keep close.
              </p>

              <div className="mt-8 flex justify-center">
                <Link
                  href="/gallery"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-400 px-7 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  Browse Products
                </Link>
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {favoriteProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={getImageUrl(product.productImage)}
                  alt={product.productTitle}
                  className="h-64 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => toggleFavorite(product)}
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-105"
                  aria-label={`Remove ${product.productTitle} from wishlist`}
                >
                  <Heart size={18} fill="#ef4444" color="#ef4444" />
                </button>
              </div>

              <div className="space-y-5 p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
                    {getCategoryName(product.category)}
                  </span>
                  <span className="text-2xl font-black text-slate-900">
                    ₹{product.productPrice}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{product.productTitle}</h3>
                  <p className="mt-2 text-sm font-medium text-slate-500">{getVendorName(product.vendor)}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => toggleFavorite(product)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>

                  <Link
                    href={`/gallery/product/${product.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-400 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
                  >
                    View Product
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-16 rounded-3xl border border-white/70 bg-white/65 px-6 py-8 text-center shadow-sm backdrop-blur-sm sm:px-8">
          <div className="flex items-center justify-center gap-3 text-slate-500">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em]">
              Saved items
            </span>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">
            {favoriteProducts.length} product{favoriteProducts.length === 1 ? "" : "s"} in your wishlist
          </p>
        </div>

      </SectionContainer>
      <Footer />
    </div>
  );
}
