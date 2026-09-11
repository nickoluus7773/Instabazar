"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BadgeCheck, MapPin, Package, Search, Users } from "lucide-react";
import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/home/Footer";
import { getPublicVendorBySlug } from "@/lib/vendorApi";
import { getVendorStoreData } from "@/app/data/vendorStoreData";
import { getLocalVendorImage } from "@/app/data/vendorImages";

const categoryEmojis = {
  "Fashion & Accessories": "👗",
  "Vintage & Retro": "📻",
  Handmade: "🧶",
  Fashion: "👗",
  "Home Decor": "🏺",
  Jewellery: "💍",
  Art: "🎨",
  Food: "🍫",
  Candles: "🕯️",
  Electronics: "📱",
  Books: "📚",
  Music: "🎵",
  Accessories: "👜",
};

function getImageUrl(image) {
  if (!image) return "";

  if (
    (image.startsWith("http://") || image.startsWith("https://")) &&
    !image.includes("/products/")
  ) {
    return image;
  }

  if (image.includes("/products/")) {
    const filename = image.split("/products/").pop();
    return `/images/${filename}`;
  }

  return image;
}

export default function VendorDetailPage() {
  const { slug } = useParams();
  const [vendor, setVendor] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    async function loadVendor() {
      try {
        const vendorData = await getPublicVendorBySlug(slug);
        const mockStore = getVendorStoreData(slug);
        if (!vendorData.product_count && mockStore) {
          vendorData.product_count = mockStore.products.length;
          vendorData.category_name = mockStore.category;
          setStoreData(mockStore);
        }
        setVendor(vendorData);
      } catch (loadError) {
        const mockStore = getVendorStoreData(slug);
        if (mockStore) {
          const businessName = slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
          setVendor({ business_name: businessName, store_slug: slug, bio: `Discover amazing products from ${businessName}. Browse our curated collection of unique items.`, location: "India", follower_count: "1.2K", product_count: mockStore.products.length, verification_status: "verified", category_name: mockStore.category, logo_url: null });
          setStoreData(mockStore);
        } else {
          setError(loadError.message || "Could not load vendor data.");
        }
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadVendor();
  }, [slug]);

  if (loading) {
    return <><Navbar /><main className="min-h-screen bg-[#f5f3ef] px-6 py-20"><div className="mx-auto max-w-7xl animate-pulse"><div className="h-80 rounded-[2rem] bg-slate-200" /><div className="mt-10 h-8 w-56 rounded bg-slate-200" /><div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-96 rounded-[1.5rem] bg-white" />)}</div></div></main></>;
  }

  if (error || !vendor) {
    return <><Navbar /><main className="flex min-h-[70vh] items-center justify-center bg-[#f5f3ef] px-6"><div className="text-center"><p className="text-5xl">🏪</p><h1 className="mt-5 text-3xl font-black text-slate-900">Vendor not found</h1><p className="mt-3 text-slate-500">{error || "This store is not available right now."}</p><Link href="/vendors" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"> <ArrowLeft size={16} /> Back to vendors</Link></div></main></>;
  }

  const products = vendor.products || storeData?.products || [];
  const categoryName = vendor.category_name || storeData?.category || "Store";
  const vendorImage = getLocalVendorImage(vendor) || vendor.logo_url;
  const displayImage = vendorImage && !imageFailed;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f5f3ef]">
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-8 sm:px-8 lg:px-10 lg:pb-16">
            <Link href="/vendors" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"><ArrowLeft size={16} /> Back to vendors</Link>
            <div className="mt-10 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
                <div className="h-32 w-32 shrink-0 overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-orange-200 via-pink-200 to-fuchsia-300 shadow-2xl">
                  {displayImage ? <img src={vendorImage} alt={`${vendor.business_name} storefront`} onError={() => setImageFailed(true)} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-5xl">{categoryEmojis[categoryName] || "🏪"}</div>}
                </div>
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-3"><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-200">{categoryName}</span>{vendor.verification_status === "verified" && <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300"><BadgeCheck size={15} /> Verified store</span>}</div>
                  <h1 className="text-4xl font-black tracking-tight sm:text-6xl">{vendor.business_name}</h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{vendor.bio || "A curated collection from an independent creator."}</p>
                  <div className="mt-5 flex flex-wrap gap-5 text-sm font-semibold text-slate-300"><span className="inline-flex items-center gap-2"><MapPin size={16} className="text-orange-300" /> {vendor.location || "Independent seller"}</span><span className="inline-flex items-center gap-2"><Users size={16} className="text-fuchsia-300" /> {vendor.follower_count || 0} followers</span><span className="inline-flex items-center gap-2"><Package size={16} className="text-sky-300" /> {vendor.product_count || products.length} products</span></div>
                </div>
              </div>
              <div className="hidden rounded-2xl border border-white/10 bg-white/10 p-5 text-right backdrop-blur sm:block"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Store collection</p><p className="mt-2 text-3xl font-black">{products.length}</p><p className="text-sm text-slate-300">pieces to explore</p></div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-fuchsia-600">The collection</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Shop {vendor.business_name}</h2><p className="mt-2 text-sm text-slate-500">Take a closer look at every piece in this store.</p></div><div className="hidden items-center gap-2 text-sm font-semibold text-slate-400 sm:flex"><Search size={16} /> Curated for you</div></div>

          {products.length > 0 ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <article key={product.id} className="group overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]">
          <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-rose-50 to-fuchsia-50">
  {product.productImage ? (
    <img
      src={getImageUrl(product.productImage)}
      alt={product.productTitle}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
    />
  ) : (
    <div className="text-slate-400 text-sm">
      No image available
    </div>
  )}
</div>
          <div className="p-5"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{product.category}</span><h3 className="mt-4 line-clamp-2 min-h-14 text-lg font-black leading-tight text-slate-900">{product.productTitle}</h3><p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">{product.productDescription}</p><div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4"><span className="text-xl font-black text-slate-900">₹{parseInt(product.productPrice, 10).toLocaleString()}</span><Link href={`/gallery/product/${product.id}?vendor=${slug}`} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-fuchsia-600">View Product <ArrowUpRight size={14} /></Link></div></div></article>)}</div> : <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><Package className="mx-auto text-slate-300" size={38} /><h3 className="mt-4 text-xl font-black text-slate-900">No products yet</h3><p className="mt-2 text-sm text-slate-500">This vendor has not listed any products yet. Check back soon.</p></div>}

          <div className="mt-12 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-6"><div className="flex items-start gap-3"><span className="text-2xl">⚠️</span><div><h4 className="font-black text-amber-900">Shop safely</h4><p className="mt-1 text-sm leading-6 text-amber-800">InstaBazaar helps you discover stores. Confirm details with the vendor before purchasing, and read our <Link href="/legal/disclaimer" className="font-bold underline">safety disclaimer</Link>.</p></div></div></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
