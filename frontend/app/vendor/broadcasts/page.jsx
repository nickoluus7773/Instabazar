"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Archive, BarChart3, Megaphone, Plus, Trash2 } from "lucide-react";
import Navbar from "@/app/components/layout/Navbar";
import { archiveBroadcast, deleteBroadcast, getBroadcastAnalytics, getBroadcastEligibility } from "@/lib/broadcastApi";

const card = "rounded-2xl border border-white/10 bg-[#11162A] p-5 shadow-lg shadow-black/10";

export default function VendorBroadcastsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(0);
  const load = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const [access, stats] = await Promise.all([
        getBroadcastEligibility(token),
        getBroadcastAnalytics(token).catch(() => null),
      ]);
      setAnalytics(stats); setEligibility(access); setError("");
    } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(load, 0); return () => window.clearTimeout(timer); }, [load]);
  const perform = async (action, id) => { setBusy(id); try { await action(localStorage.getItem("accessToken"), id); await load(); } catch (e) { setError(e.message); } finally { setBusy(0); } };

  return <><Navbar /><main className="min-h-screen bg-[#090D1A] px-4 py-8 text-white sm:px-8"><div className="mx-auto max-w-6xl">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[.2em] text-violet-300">Seller workspace</p><h1 className="text-3xl font-bold">Bazaar Broadcasts</h1><p className="mt-2 text-slate-400">Share announcements with customers who follow your store.</p></div>{eligibility?.eligible ? <Link href="/vendor/broadcasts/create" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500"><Plus size={18}/> Create Broadcast</Link> : <Link href="/subscription" className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 px-5 py-3 font-semibold text-violet-200 hover:bg-violet-500/10">View eligible plans</Link>}</div>
    {error && <p role="alert" className="mb-5 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-rose-200">{error}</p>}
    {eligibility && !eligibility.eligible && <div className={`${card} mb-6 border-amber-300/20 text-amber-100`}><p>{eligibility.detail} Bazaar Broadcasts are available with the Advanced plan.</p></div>}
    {analytics && <>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Published this month", `${analytics.published_this_month} / ${analytics.monthly_limit}`, Megaphone], ["Recipients", analytics.recipients || 0, "users"], ["Reads", analytics.reads || 0, "reads"], ["Product / store clicks", `${analytics.product_clicks || 0} / ${analytics.storefront_clicks || 0}`, BarChart3]].map(([label, value, Icon]) => <section className={card} key={label}><div className="flex items-center justify-between"><p className="text-sm text-slate-400">{label}</p>{typeof Icon !== "string" && <Icon className="text-violet-300" size={19}/>}</div><p className="mt-3 text-2xl font-bold">{value}</p></section>)}</div>
      <section className={card}><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">Broadcast history</h2><span className="text-sm text-slate-400">{eligibility?.remaining ?? analytics.remaining} broadcasts remaining this month</span></div>
        {analytics.broadcasts?.length ? <div className="space-y-3">{analytics.broadcasts.map((item) => <article key={item.id} className="flex flex-col gap-4 rounded-xl border border-white/10 p-4 sm:flex-row sm:items-center"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white/5">{item.image && <img src={item.image} alt="" className="h-full w-full object-cover"/>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{item.title}</h3><span className="rounded-full bg-white/10 px-2.5 py-1 text-xs capitalize text-slate-300">{item.status}</span></div><p className="mt-1 line-clamp-2 text-sm text-slate-400">{item.message}</p><p className="mt-2 text-xs text-slate-500">{item.published_at ? new Date(item.published_at).toLocaleDateString("en-IN") : "Draft"} · {item.recipient_count || 0} recipients · {item.read_count || 0} reads ({item.recipient_count ? Math.round((item.read_count || 0) * 100 / item.recipient_count) : 0}%) · {(item.product_click_count || 0) + (item.storefront_click_count || 0)} clicks</p><Link href={`/vendor/broadcasts/${item.id}`} className="mt-2 inline-block text-sm font-semibold text-violet-300 hover:text-white">View details</Link></div><div className="flex gap-2">{item.status === "published" && <button disabled={busy === item.id} onClick={() => perform(archiveBroadcast, item.id)} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5" title="Archive"><Archive size={17}/></button>}{item.status === "draft" && <button disabled={busy === item.id} onClick={() => perform(deleteBroadcast, item.id)} className="rounded-lg border border-rose-400/20 p-2 text-rose-300 hover:bg-rose-400/10" title="Delete draft"><Trash2 size={17}/></button>}</div></article>)}</div> : <div className="py-14 text-center"><Megaphone className="mx-auto text-violet-300" size={36}/><h3 className="mt-4 font-semibold">No broadcasts yet</h3><p className="mt-2 text-sm text-slate-400">You haven’t published any broadcasts yet. Share your first update with your followers.</p></div>}
      </section>
    </>}
  </div></main></>;
}
