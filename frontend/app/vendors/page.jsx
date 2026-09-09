"use client";

import { useEffect, useMemo, useState } from "react";
import { Compass, Search, ShieldCheck, Sparkles, Store, Users } from "lucide-react";
import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/home/Footer";
import VendorCard from "@/app/components/vendors/VendorCard";
import { getPublicVendors } from "@/lib/vendorApi";

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVendors() {
      try {
        setVendors(await getPublicVendors());
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadVendors();
  }, []);

  const filteredVendors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return vendors;
    return vendors.filter((vendor) => [vendor.business_name, vendor.location, vendor.bio].filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery));
  }, [query, vendors]);

  return (
    <main className="min-h-screen bg-[#f5f3ef]">
      <Navbar />
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -right-28 -top-36 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -bottom-48 left-1/3 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-14 sm:px-8 lg:px-10 lg:pb-20 lg:pt-20">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-200"><Sparkles size={15} /> The InstaBazaar directory</p>
            <h1 className="text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl">Good finds start with the right store.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Meet independent sellers, discover carefully selected collections, and shop from creators you can trust.</p>
          </div>
          <div className="mt-10 max-w-2xl">
            <label className="relative block"><span className="sr-only">Search vendors</span><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by store name, location, or story..." className="h-14 w-full rounded-2xl border border-white/10 bg-white px-5 pl-14 text-sm font-medium text-slate-900 outline-none shadow-2xl shadow-slate-950/30 placeholder:text-slate-400 focus:ring-4 focus:ring-fuchsia-400/25" /></label>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="mb-9 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-fuchsia-600">Explore the community</p><h2 className="text-3xl font-black tracking-tight text-slate-900">Stores worth knowing</h2><p className="mt-2 text-sm text-slate-500">Curated vendors from the InstaBazaar community.</p></div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm"><Store size={17} className="mx-auto mb-1 text-orange-500" /><strong className="block text-lg text-slate-900">{vendors.length}</strong><span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Stores</span></div>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm"><Users size={17} className="mx-auto mb-1 text-fuchsia-500" /><strong className="block text-lg text-slate-900">{vendors.reduce((sum, vendor) => sum + Number(vendor.follower_count || 0), 0)}</strong><span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Followers</span></div>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm"><ShieldCheck size={17} className="mx-auto mb-1 text-emerald-500" /><strong className="block text-lg text-slate-900">{vendors.filter((vendor) => vendor.verification_status === "verified").length}</strong><span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Verified</span></div>
          </div>
        </div>

        {loading && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-[28rem] animate-pulse rounded-[1.75rem] bg-white shadow-sm"><div className="h-48 rounded-t-[1.75rem] bg-slate-200" /><div className="space-y-4 p-5"><div className="h-4 w-2/5 rounded bg-slate-200" /><div className="h-7 w-3/4 rounded bg-slate-200" /><div className="h-12 rounded bg-slate-100" /></div></div>)}</div>}
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">{error}</div>}
        {!loading && !error && filteredVendors.length === 0 && <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><Compass className="mx-auto text-slate-300" size={34} /><h3 className="mt-4 text-xl font-black text-slate-900">No stores match that search</h3><p className="mt-2 text-sm text-slate-500">Try a different store name or clear the search.</p></div>}
        {!loading && !error && filteredVendors.length > 0 && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredVendors.map((vendor, index) => <VendorCard key={vendor.id} vendor={vendor} index={index} />)}</div>}
      </section>
      <Footer />
    </main>
  );
}
