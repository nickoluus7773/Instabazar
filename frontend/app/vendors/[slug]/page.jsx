"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/layout/Navbar";
import { useFavorites } from "@/context/FavoritesContext";
import { getPublicVendorBySlug } from "@/lib/vendorApi";

export default function VendorDetailPage() {
  const { slug } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [vendor, setVendor] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVendor() {
      try {
        setVendor(await getPublicVendorBySlug(slug));
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadVendor();
  }, [slug]);

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/vendors" className="text-sm font-medium text-purple-700 hover:text-purple-900">← Back to vendors</Link>
        {loading && <p className="mt-8 text-slate-600">Loading vendor…</p>}
        {error && <p className="mt-8 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
        {vendor && (
          <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-purple-100 text-3xl">
                {vendor.logo_url ? <img src={vendor.logo_url} alt={vendor.business_name} className="h-full w-full object-cover" /> : "🏪"}
              </div>
              {vendor.verification_status === "verified" && <span className="mt-4 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">✓ Verified</span>}
              <h1 className="mt-3 text-3xl font-extrabold text-slate-900">{vendor.business_name}</h1>
              {vendor.location && <p className="mt-2 text-sm text-slate-600">{vendor.location}</p>}
              <p className="mt-3 text-sm text-slate-600">{vendor.follower_count} followers · {vendor.product_count} products</p>
              {vendor.bio && <p className="mt-5 max-w-xl text-slate-700">{vendor.bio}</p>}
              <button type="button" onClick={() => toggleFavorite(vendor.store_slug)} className={`mt-6 rounded-full px-6 py-2.5 text-sm font-semibold transition ${isFavorite(vendor.store_slug) ? "bg-purple-600 text-white" : "border border-purple-600 text-purple-700 hover:bg-purple-50"}`}>
                {isFavorite(vendor.store_slug) ? "♥ Saved" : "♡ Save vendor"}
              </button>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
