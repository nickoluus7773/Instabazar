"use client";

import Link from "next/link";

export default function QuickLinks({ vendorSlug }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      {/* Manage Products */}
      <Link
        href="/vendor/products"
        className="glass rounded-2xl border border-white/40 shadow-sm p-5 card-hover flex items-center gap-4 group"
      >
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            Manage Products
          </p>
          <p className="text-xs text-gray-400">Edit, delete, toggle visibility</p>
        </div>
      </Link>

      {/* Marketing Tools */}
      <Link
        href="/vendor/marketing"
        className="glass rounded-2xl border border-white/40 shadow-sm p-5 card-hover flex items-center gap-4 group"
      >
        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
          <svg
            className="w-6 h-6 text-purple-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
            Marketing Tools
          </p>
          <p className="text-xs text-gray-400">SEO score, social auto-post</p>
        </div>
      </Link>

      {/* View Public Profile */}
      <Link
        href={`/vendors/${vendorSlug}`}
        className="glass rounded-2xl border border-white/40 shadow-sm p-5 card-hover flex items-center gap-4 group"
      >
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
          <svg
            className="w-6 h-6 text-emerald-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
            View Public Profile
          </p>
          <p className="text-xs text-gray-400">See how customers see you</p>
        </div>
      </Link>
    </div>
  );
}
