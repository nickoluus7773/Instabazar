"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, RefreshCw, Store } from "lucide-react";
import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/home/Footer";
import { useAuth } from "@/context/AuthContext";
import { getPersonalFeed } from "@/lib/followApi";
import API_BASE_URL from "@/lib/api";

function getProductImage(image) {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  return `${API_BASE_URL.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
}

export default function PersonalFeedPage() {
  const router = useRouter();
  const { isLoggedIn, isVendor, roleResolved } = useAuth();
  const [items, setItems] = useState([]);
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roleResolved) return;
    if (!isLoggedIn) router.replace("/login");
    else if (isVendor) router.replace("/vendor/dashboard");
  }, [isLoggedIn, isVendor, roleResolved, router]);

  const loadPage = useCallback(async (page, append) => {
    setLoading(true);
    setError("");
    try {
      const data = await getPersonalFeed(localStorage.getItem("accessToken"), page);
      setItems((current) => append ? [...current, ...(data.results || [])] : (data.results || []));
      setHasMore(Boolean(data.next));
      setNextPage(page + 1);
    } catch (cause) {
      setError(cause.message || "Could not load your feed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (roleResolved && isLoggedIn && !isVendor) {
      const timer = window.setTimeout(() => loadPage(1, false), 0);
      return () => window.clearTimeout(timer);
    }
  }, [roleResolved, isLoggedIn, isVendor, loadPage]);

  return <main className="min-h-screen bg-[#f5f3ef]"><Navbar />
    <section className="bg-slate-950 px-6 py-12 text-white"><div className="mx-auto max-w-7xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-fuchsia-300">Your community</p><h1 className="mt-2 text-4xl font-black">Following Feed</h1><p className="mt-3 max-w-2xl text-slate-300">The latest active products from vendors you follow.</p></div></section>
    <section className="mx-auto max-w-7xl px-6 py-10">
      {error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error} <button className="ml-2 font-bold underline" onClick={() => loadPage(items.length ? nextPage - 1 : 1, items.length > 0)}>Retry</button></div>}
      {!loading && items.length === 0 && !error && <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><Store className="mx-auto text-fuchsia-500" size={34}/><h2 className="mt-4 text-2xl font-bold text-slate-900">Your feed is ready when you are</h2><p className="mx-auto mt-2 max-w-lg text-slate-500">Follow Standard or Advanced vendors to see their active products here.</p><Link href="/vendors" className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">Discover vendors</Link></div>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((product) => <article key={product.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex h-48 items-center justify-center bg-slate-100">{product.productImage ? <img src={getProductImage(product.productImage)} alt={product.productTitle} className="h-full w-full object-cover"/> : <Package className="text-slate-400"/>}</div><div className="p-4"><p className="text-xs font-semibold text-fuchsia-600">{product.vendor}</p><h2 className="mt-1 font-bold text-slate-900">{product.productTitle}</h2><p className="mt-1 line-clamp-2 text-sm text-slate-500">{product.productDescription}</p><div className="mt-4 flex items-center justify-between"><span className="font-black text-slate-900">₹{product.productPrice}</span><Link href={`/gallery/product/${product.id}`} className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white">View product</Link></div></div></article>)}
      </div>
      {loading && <div className="py-8 text-center text-slate-500">Loading your feed…</div>}
      {!loading && hasMore && items.length > 0 && <div className="mt-8 text-center"><button onClick={() => loadPage(nextPage, true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800"><RefreshCw size={16}/> Load more</button></div>}
    </section><Footer/></main>;
}
