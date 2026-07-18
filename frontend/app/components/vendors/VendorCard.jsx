import Link from "next/link";

export default function VendorCard({ vendor }) {
  const businessName = vendor.business_name;
  const followers = vendor.follower_count ?? 0;

  return (
    <article className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border bg-gray-50 text-3xl">
        {vendor.logo_url ? <img src={vendor.logo_url} alt={businessName} className="h-full w-full object-cover" /> : "🏪"}
      </div>
      {vendor.verification_status === "verified" && <span className="mt-4 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">✓ Verified</span>}
      <h3 className="mt-3 text-lg font-bold text-gray-900">{businessName}</h3>
      {vendor.location && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-purple-600">{vendor.location}</p>}
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
        <span>👥 {followers}</span><span>•</span><span>🛍️ {vendor.product_count ?? 0} products</span>
      </div>
      {vendor.bio && <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-gray-600">{vendor.bio}</p>}
      <Link href={`/vendors/${vendor.store_slug}`} className="mt-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:scale-105">View Shop</Link>
    </article>
  );
}
