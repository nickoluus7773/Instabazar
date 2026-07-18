"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/layout/Navbar";
import VendorCard from "@/app/components/vendors/VendorCard";
import { getPublicVendors } from "@/lib/vendorApi";

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
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

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-purple-600">Discover local creators</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Vendors</h1>
        <p className="mt-3 max-w-2xl text-slate-600">Browse stores approved by InstaBazaar.</p>

        {loading && <p className="mt-8 text-slate-600">Loading vendors…</p>}
        {error && <p className="mt-8 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
        {!loading && !error && vendors.length === 0 && (
          <p className="mt-8 rounded-xl bg-white p-6 text-slate-600">No approved vendors are available yet.</p>
        )}
        {!loading && !error && vendors.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vendors.map((vendor) => <VendorCard key={vendor.id} vendor={vendor} />)}
          </div>
        )}
      </section>
    </main>
  );
}
