"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, MapPin, Package, Users } from "lucide-react";
import { getLocalVendorImage } from "@/app/data/vendorImages";

const fallbackColors = [
  "from-orange-100 via-rose-100 to-fuchsia-100",
  "from-amber-100 via-orange-100 to-pink-100",
  "from-sky-100 via-indigo-100 to-fuchsia-100",
  "from-emerald-100 via-teal-100 to-sky-100",
];

export default function VendorCard({ vendor, index = 0 }) {
  const [imageFailed, setImageFailed] = useState(false);
  const businessName = vendor.business_name || "Independent store";
  const imageSource = getLocalVendorImage(vendor) || vendor.logo_url;
  const fallbackClass = fallbackColors[index % fallbackColors.length];

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]">
      <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${fallbackClass}`}>
        {imageSource && !imageFailed ? (
          <img src={imageSource} alt={`${businessName} storefront`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" onError={() => setImageFailed(true)} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-700">
            <span className="text-5xl">🏪</span>
            <span className="mt-2 text-xs font-bold uppercase tracking-[0.18em]">Local storefront</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/45 to-transparent" />
        {vendor.verification_status === "verified" && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm backdrop-blur"><BadgeCheck size={14} /> Verified</span>
        )}
        {vendor.location && (
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 text-xs font-semibold text-white"><MapPin size={14} /> {vendor.location}</span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-fuchsia-600">Independent store</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">{businessName}</h2>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition group-hover:bg-slate-950 group-hover:text-white"><ArrowUpRight size={17} /></span>
        </div>
        <p className="mt-3 min-h-12 line-clamp-2 text-sm leading-6 text-slate-500">{vendor.bio || "A curated collection waiting to be discovered."}</p>
        <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1.5"><Users size={15} className="text-fuchsia-500" /> {vendor.follower_count ?? 0} followers</span>
          <span className="inline-flex items-center gap-1.5"><Package size={15} className="text-orange-500" /> {vendor.product_count ?? 0} products</span>
        </div>
        <Link href={`/vendors/${vendor.store_slug}`} className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-bold text-white transition hover:bg-fuchsia-600">Explore shop <ArrowUpRight size={16} /></Link>
      </div>
    </article>
  );
}
