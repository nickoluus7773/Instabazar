"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, Eye, MousePointer2, Users } from "lucide-react";
import Navbar from "@/app/components/layout/Navbar";
import { getBroadcastAnalytics } from "@/lib/broadcastApi";

export default function BroadcastAnalyticsPage({ params }) {
  const { id } = use(params);
  const [broadcast, setBroadcast] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => getBroadcastAnalytics(localStorage.getItem("accessToken"))
      .then((data) => setBroadcast(data.broadcasts?.find((item) => String(item.id) === id) || null))
      .catch((e) => setError(e.message)), 0);
    return () => window.clearTimeout(timer);
  }, [id]);
  const metrics = broadcast ? [
    ["Recipients", broadcast.recipient_count || 0, Users],
    ["Reads", `${broadcast.read_count || 0} (${broadcast.recipient_count ? Math.round((broadcast.read_count || 0) * 100 / broadcast.recipient_count) : 0}%)`, Eye],
    ["Product clicks", broadcast.product_click_count || 0, MousePointer2],
    ["Storefront clicks", broadcast.storefront_click_count || 0, BarChart3],
  ] : [];
  return <><Navbar/><main className="min-h-screen bg-[#090D1A] px-4 py-8 text-white sm:px-8"><div className="mx-auto max-w-5xl"><Link href="/vendor/broadcasts" className="mb-6 inline-flex items-center gap-2 text-sm text-violet-300"><ArrowLeft size={16}/> Broadcast history</Link>{error && <p role="alert" className="rounded-xl bg-rose-400/10 p-4 text-rose-200">{error}</p>}{!error && !broadcast ? <p className="rounded-2xl border border-white/10 bg-[#11162A] p-8 text-slate-400">Loading broadcast analytics…</p> : broadcast && <><p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-300">Broadcast analytics</p><h1 className="mt-2 text-3xl font-bold">{broadcast.title}</h1><p className="mt-2 text-slate-400">Published {broadcast.published_at ? new Date(broadcast.published_at).toLocaleString("en-IN") : "as a draft"}</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([label, value, Icon])=><section key={label} className="rounded-2xl border border-white/10 bg-[#11162A] p-5"><div className="flex items-center justify-between text-sm text-slate-400"><span>{label}</span><Icon size={18} className="text-violet-300"/></div><p className="mt-3 text-2xl font-bold">{value}</p></section>)}</div><section className="mt-6 rounded-2xl border border-white/10 bg-[#11162A] p-6"><h2 className="font-semibold">Delivered content</h2><p className="mt-3 whitespace-pre-wrap text-slate-300">{broadcast.message}</p></section></>}</div></main></>;
}
