"use client";

import Link from "next/link";

export default function DashboardStats({ stats, subscriptionPlan }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {/* Total Products */}
      <div className="glass rounded-2xl border border-white/40 shadow-sm p-6 card-hover animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">Total Products</span>
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
        <p className="text-xs text-gray-400 mt-1">
          of {stats?.maxProducts || 0} max
        </p>
      </div>

      {/* Total Views */}
      <div className="glass rounded-2xl border border-white/40 shadow-sm p-6 card-hover animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">Total Views</span>
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600"
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
        </div>
        <p className="text-3xl font-bold text-gray-900">{stats?.totalViews || 0}</p>
        <p className="text-xs text-gray-400 mt-1">across all products</p>
      </div>

      {/* Total Favorites */}
      <div className="glass rounded-2xl border border-white/40 shadow-sm p-6 card-hover animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">Total Favorites</span>
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{stats?.totalFavorites || 0}</p>
        <p className="text-xs text-gray-400 mt-1">products saved by users</p>
      </div>

      {/* Plan */}
      <div className="glass rounded-2xl border border-white/40 shadow-sm p-6 card-hover animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">Plan</span>
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <span className="text-lg">
              {subscriptionPlan === "paid" ? "⭐" : "🆓"}
            </span>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {subscriptionPlan === "paid" ? "Premium" : "Free"}
        </p>
        <Link
          href="/vendor/subscription"
          className="text-xs text-blue-600 font-semibold hover:text-blue-700 mt-1 inline-block"
        >
          {subscriptionPlan === "free" ? "Upgrade" : "Manage"} →
        </Link>
      </div>
    </div>
  );
}
