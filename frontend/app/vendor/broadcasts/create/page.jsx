"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Megaphone } from "lucide-react";
import Navbar from "@/app/components/layout/Navbar";
import { createBroadcast, getBroadcastEligibility, getBroadcastProducts, publishBroadcast } from "@/lib/broadcastApi";

export default function CreateBroadcastPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]); const [access, setAccess] = useState(null);
  const [title, setTitle] = useState(""); const [message, setMessage] = useState(""); const [product, setProduct] = useState("");
  const [image, setImage] = useState(null); const [preview, setPreview] = useState(""); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    getBroadcastEligibility(token)
      .then((eligibility) => {
        setAccess(eligibility);
        if (eligibility.eligible) return getBroadcastProducts(token).then(setProducts);
        return null;
      })
      .catch((e) => setError(e.message));
  }, []);
  function handleImageChange(event) {
    const selected = event.target.files?.[0] || null;
    setImage(selected);
    if (!selected) { setPreview(""); return; }
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result || ""));
    reader.readAsDataURL(selected);
  }
  async function submit(publish) {
    setError(""); if (!title.trim() || !message.trim()) { setError("Add a title and message before saving."); return; }
    if (publish && !window.confirm(`Publish to ${access?.follower_count ?? "your"} followers now?`)) return;
    setSaving(true);
    try { const body = new FormData(); body.append("title", title); body.append("message", message); if (product) body.append("product", product); if (image) body.append("image", image);
      const draft = await createBroadcast(localStorage.getItem("accessToken"), body);
      if (publish) await publishBroadcast(localStorage.getItem("accessToken"), draft.id);
      router.push("/vendor/broadcasts");
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }
  return <><Navbar/><main className="min-h-screen bg-[#090D1A] px-4 py-8 text-white sm:px-8"><div className="mx-auto max-w-5xl"><Link href="/vendor/broadcasts" className="mb-6 inline-flex items-center gap-2 text-sm text-violet-300"><ArrowLeft size={16}/> Broadcast history</Link><h1 className="text-3xl font-bold">Create a broadcast</h1><p className="mt-2 text-slate-400">One update, delivered to the customers who follow your store.</p>
    {error && <p role="alert" className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-rose-200">{error}</p>}
    {access && <p className="mt-5 rounded-xl border border-white/10 bg-[#11162A] p-4 text-sm text-slate-300">{access.eligible ? `${access.remaining} of ${access.limit} monthly broadcasts remaining · ${access.follower_count} followers will receive it.` : access.detail}</p>}
    {!access ? <p className="mt-6 rounded-xl border border-white/10 bg-[#11162A] p-5 text-slate-400">Checking subscription eligibility…</p> : !access.eligible ? <section className="mt-6 rounded-2xl border border-white/10 bg-[#11162A] p-7"><h2 className="text-xl font-semibold">Broadcasts require an eligible plan</h2><p className="mt-2 text-slate-400">{access.detail}</p><Link href="/subscription" className="mt-5 inline-flex rounded-xl bg-violet-600 px-5 py-3 font-semibold">View subscription plans</Link></section> : <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><section className="space-y-5 rounded-2xl border border-white/10 bg-[#11162A] p-5 sm:p-7"><label className="block text-sm font-medium">Title<input maxLength={120} value={title} onChange={e=>setTitle(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#090D1A] px-4 py-3 text-white outline-none focus:border-violet-400" placeholder="New collection available!"/><span className="mt-1 block text-right text-xs text-slate-500">{title.length}/120</span></label><label className="block text-sm font-medium">Message<textarea maxLength={2000} rows={6} value={message} onChange={e=>setMessage(e.target.value)} className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#090D1A] px-4 py-3 text-white outline-none focus:border-violet-400" placeholder="Tell followers what’s new…"/><span className="mt-1 block text-right text-xs text-slate-500">{message.length}/2000</span></label><label className="block text-sm font-medium">Image <span className="text-slate-500">(optional, up to 5 MB)</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="mt-2 block w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-500/15 file:px-3 file:py-2 file:text-violet-200"/>{image && <button type="button" onClick={()=>{setImage(null);setPreview("");}} className="mt-2 text-xs text-rose-300">Remove image</button>}</label><label className="block text-sm font-medium">Attach a product <span className="text-slate-500">(optional)</span><select value={product} onChange={e=>setProduct(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#090D1A] px-4 py-3 text-white"><option value="">No product</option>{products.map(p=><option key={p.id} value={p.id}>{p.title} · ₹{p.price}</option>)}</select></label><div className="flex flex-wrap gap-3 border-t border-white/10 pt-5"><button disabled={saving} onClick={()=>submit(false)} className="rounded-xl border border-white/15 px-5 py-3 font-semibold text-slate-200 hover:bg-white/5">Save Draft</button><button disabled={saving || access.remaining === 0} onClick={()=>submit(true)} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"><Megaphone size={17}/>{saving ? "Saving…" : "Publish"}</button></div></section>
      <aside className="h-fit rounded-2xl border border-white/10 bg-[#11162A] p-5"><p className="text-xs font-semibold uppercase tracking-widest text-violet-300">Preview</p><article className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#090D1A]">{preview ? <img src={preview} alt="Broadcast preview" className="max-h-64 w-full object-cover"/> : <div className="flex h-36 items-center justify-center text-slate-600"><ImagePlus size={34}/></div>}<div className="p-4"><div className="mb-3 flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-violet-500/15 text-violet-300"><Megaphone size={17}/></span><span className="text-sm font-medium">Your store</span></div><h2 className="font-semibold">{title || "Your broadcast title"}</h2><p className="mt-2 whitespace-pre-wrap text-sm text-slate-400">{message || "Your announcement preview will appear here."}</p>{product && <p className="mt-4 rounded-lg border border-white/10 p-3 text-sm text-slate-300">{products.find(p=>String(p.id)===product)?.title}</p>}</div></article></aside></div>}
  </div></main></>;
}
