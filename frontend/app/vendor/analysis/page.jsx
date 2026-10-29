"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock3,
  CreditCard,
  Download,
  Eye,
  FileSpreadsheet,
  Heart,
  Link2,
  Layers,
  LayoutDashboard,
  LoaderCircle,
  Lock,
  Package,
  RefreshCw,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { getVendorAnalysis, getVendorProfile } from "@/lib/vendorApi";
import API_BASE_URL from "@/lib/api";
import { getImageUrl } from "@/lib/imageHelper";
import Navbar from "@/app/components/layout/Navbar";
import InstagramIcon from "@/app/components/common/InstagramIcon";
import TrafficTrendChart from "@/app/components/vendor/analysis/TrafficTrendChart";
import WishlistTrendChart from "@/app/components/vendor/analysis/WishlistTrendChart";

const navigation = [
  { label: "Overview", href: "/vendor/dashboard", icon: LayoutDashboard },
  { label: "Analysis", href: "/vendor/analysis", icon: BarChart3 },
  { label: "My Products", href: "/vendor/products", icon: Package },
  { label: "Wishlist Analytics", href: "/vendor/dashboard?tab=wishlist", icon: Heart },
  { label: "Store Profile", href: "/vendor/profile", icon: Store },
  { label: "Followers", href: "/vendor/dashboard?tab=followers", icon: Users },
  { label: "Subscription", href: "/subscription", icon: CreditCard },
];

function Panel({ children, className = "", id }) {
  return (
    <section
      id={id}
      className={`rounded-2xl border border-white/[0.08] bg-[#11162A] ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
            {eyebrow}
          </p>
        )}
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function LockedFeatureOverlay({ title, requiredPlan = "Standard", description }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/20 via-[#11162A] to-[#141A33] p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-300">
        <Lock size={22} />
      </div>
      <h3 className="mt-3 text-base font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
        {description || `This feature is available exclusively on the ${requiredPlan} or Advanced plan.`}
      </p>
      <div className="mt-4">
        <Link
          href="/subscription"
          className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-950/40 transition hover:bg-violet-500"
        >
          Upgrade to {requiredPlan} <ArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, subtext, locked = false, requiredPlan = "Standard", accent = "violet" }) {
  const accentClasses = {
    violet: "bg-violet-500/15 text-violet-300",
    pink: "bg-pink-500/15 text-pink-300",
    blue: "bg-sky-500/15 text-sky-300",
    emerald: "bg-emerald-500/15 text-emerald-300",
    amber: "bg-amber-500/15 text-amber-300",
  };

  if (locked) {
    return (
      <Panel className="relative overflow-hidden p-5 border-dashed border-white/10 opacity-75">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">{label}</p>
            <div className="mt-2 flex items-center gap-2">
              <Lock size={16} className="text-slate-500" />
              <span className="text-sm font-semibold text-slate-500">Locked</span>
            </div>
          </div>
          <span className="rounded-lg bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-slate-400">
            {requiredPlan}+
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          <Link href="/subscription" className="text-violet-400 hover:underline">
            Upgrade
          </Link>{" "}
          to unlock {label.toLowerCase()}.
        </p>
      </Panel>
    );
  }

  return (
    <Panel className="p-5 transition hover:border-violet-400/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentClasses[accent] || accentClasses.violet}`}>
          <Icon size={20} />
        </div>
      </div>
      {subtext && <p className="mt-2 text-xs text-slate-500">{subtext}</p>}
    </Panel>
  );
}

function downloadCSV(filename, rows) {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    rows.map((e) => e.map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function VendorAnalysisPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const [period, setPeriod] = useState("30");
  const [data, setData] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [visibleProductsCount, setVisibleProductsCount] = useState(5);

  const fetchData = useCallback(
    async (showRefresh = false, selectedPeriod = period) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

      if (!token) {
        setLoading(false);
        router.replace("/login");
        return;
      }

      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      try {
        const [profileRes, analysisRes] = await Promise.all([
          getVendorProfile(token).catch(() => null),
          getVendorAnalysis(token, selectedPeriod),
        ]);

        setVendor(profileRes);
        setData(analysisRes);
      } catch (err) {
        setError(err.message || "Could not load vendor analysis.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period, router]
  );

  useEffect(() => {
    fetchData(false, period);
  }, [fetchData, period]);

  const planCode = (data?.plan_code || "free").toLowerCase();
  const isFree = planCode === "free";
  const isStandard = planCode === "standard";
  const isAdvanced = planCode === "advanced";

  const handleExportProductsCSV = () => {
    if (!isAdvanced) return;
    const headers = ["Product ID", "Title", "Category", "Price (INR)", "Stock", "Views", "Wishlist Saves"];
    const rows = (data?.top_products || []).map((p) => [
      p.id,
      p.title,
      p.category || "General",
      p.price,
      p.stock,
      p.views,
      p.wishlist_count,
    ]);
    downloadCSV(`InstaBazaar_Products_Analysis_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  };

  const handleExportWishlistCSV = () => {
    if (!isAdvanced) return;
    const headers = ["Metric", "Value", "Date Generated"];
    const now = new Date().toLocaleString();
    const rows = [
      ["Total Wishlist Saves", data?.total_wishlist_saves || 0, now],
      ["View-to-Wishlist Rate", `${data?.view_to_wishlist_rate || 0}%`, now],
      ["Instagram DM Clicks", data?.instagram_dm_clicks || 0, now],
      ["Wishlist vs DM Ratio", data?.wishlist_vs_dm?.ratio || "N/A", now],
      ["Top Wishlisted Product", data?.top_products?.[0]?.title || "N/A", now],
    ];
    downloadCSV(`InstaBazaar_Wishlist_Analytics_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  };

  if (loading && !data) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[75vh] items-center justify-center bg-[#090D1A] px-4 text-white">
          <div className="text-center">
            <LoaderCircle className="mx-auto animate-spin text-violet-400" size={34} />
            <p className="mt-4 text-sm text-slate-400">Loading your store analysis...</p>
          </div>
        </main>
      </>
    );
  }

  const latestProduct = data?.latest_product;
  const topProducts = data?.top_products || [];
  const trendCharts = data?.trend_charts || [];
  const recentFollowers = data?.recent_followers || [];
  const categoryPerformance = data?.category_performance || [];
  const wishlistAdditions = data?.wishlist_additions_trend || [];
  const wishlistVsDm = data?.wishlist_vs_dm;
  const periodComparison = data?.period_comparison;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#090D1A] text-white">
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            {/* Sidebar */}
            <aside className="h-fit rounded-2xl border border-white/[0.08] bg-[#11162A] p-4 lg:sticky lg:top-6">
              <div className="mb-6 flex items-center gap-3 px-2 py-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-950/40">
                  <Store size={22} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">InstaBazaar</p>
                  <p className="text-xs text-slate-500">Seller workspace</p>
                </div>
              </div>

              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Workspace
              </p>

              <nav className="space-y-1">
                {navigation.map(({ label, href, icon: Icon }) => {
                  const isActive = label === "Analysis";
                  return (
                    <Link
                      key={label}
                      href={href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                        isActive
                          ? "bg-violet-500/15 font-medium text-violet-200 ring-1 ring-violet-400/20"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <Icon size={18} />
                      <span>{label}</span>
                      {label === "Analysis" && (
                        <span className="ml-auto rounded-md bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                          {data?.plan_name || "Plan"}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 rounded-xl border border-violet-400/15 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-4">
                <div className="flex items-center gap-2 text-violet-200">
                  <Sparkles size={17} />
                  <span className="text-sm font-semibold">Subscription tier</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Currently on the <span className="font-semibold text-white">{data?.plan_name}</span> plan. Features are gated according to your tier.
                </p>
                <Link
                  href="/subscription"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-white"
                >
                  Manage subscription <ArrowUpRight size={14} />
                </Link>
              </div>
            </aside>

            {/* Main Content */}
            <div className="min-w-0 space-y-6">
              {/* Header */}
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                    <Link href="/vendor/dashboard" className="hover:text-slate-300">
                      Seller workspace
                    </Link>
                    <ChevronRight size={13} />
                    <span className="text-violet-300">Analysis</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Storefront Analysis
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400">
                    Functional performance metrics tailored to your {data?.plan_name} plan.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => fetchData(true, period)}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-300 transition hover:bg-white/[0.07] disabled:opacity-50"
                  >
                    <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                    Refresh
                  </button>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-semibold ${
                      isAdvanced
                        ? "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300"
                        : isStandard
                        ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
                        : "border-slate-700 bg-slate-800 text-slate-300"
                    }`}
                  >
                    <Zap size={14} />
                    {data?.plan_name} Plan
                  </span>
                </div>
              </div>

              {/* Upgrade Banner for non-Advanced users */}
              {!isAdvanced && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-violet-500/25 bg-gradient-to-r from-violet-950/40 via-[#131730] to-[#10142A] p-5">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {isFree
                          ? "Unlock Trend Charts, DM Clicks, and Category Analysis"
                          : "Unlock 30/90-Day Trends, Date Comparisons & CSV Exports"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {isFree
                          ? "Upgrade to Standard or Advanced to see deeper shopper activity."
                          : "Upgrade to Advanced to compare performance across time and export CSV reports."}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/subscription"
                    className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-950/40 transition hover:bg-violet-500"
                  >
                    Upgrade plan <ArrowUpRight size={14} />
                  </Link>
                </div>
              )}

              {/* Core Metric Cards (Photo rows 2-5) */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  icon={Store}
                  label="Store visits"
                  value={data?.store_visits ?? 0}
                  subtext="Customer visits to your storefront"
                  accent="violet"
                />
                <MetricCard
                  icon={Eye}
                  label="Product views"
                  value={data?.product_views ?? 0}
                  subtext="Combined views on active products"
                  accent="blue"
                />
                <MetricCard
                  icon={InstagramIcon}
                  label="Instagram DM clicks"
                  value={data?.instagram_dm_clicks ?? "—"}
                  locked={isFree}
                  requiredPlan="Standard"
                  subtext="Shoppers clicking through to Instagram"
                  accent="pink"
                />
                <MetricCard
                  icon={Heart}
                  label="Total wishlist saves"
                  value={data?.total_wishlist_saves ?? 0}
                  subtext="Products saved to customer wishlists"
                  accent="emerald"
                />
              </div>

              {/* Latest Product Performance (Photo row 1) */}
              <div>
                <SectionHeading
                  eyebrow="Catalog Spotlight"
                  title="Latest product perform"
                  description="Real-time performance of your most recently listed product."
                />
                <Panel className="p-5 sm:p-6">
                  {latestProduct ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#1A2038]">
                        {latestProduct.image ? (
                          <img
                            src={getImageUrl(latestProduct.image)}
                            alt={latestProduct.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-600">
                            <Package size={28} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-white truncate">
                            {latestProduct.title}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                              latestProduct.is_active
                                ? "bg-emerald-400/15 text-emerald-300"
                                : "bg-slate-500/15 text-slate-400"
                            }`}
                          >
                            {latestProduct.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {latestProduct.category || "General"} • ₹{latestProduct.price} • Stock: {latestProduct.stock}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 border-t border-white/[0.07] pt-4 sm:border-t-0 sm:pt-0">
                        <div className="text-center">
                          <p className="text-[11px] text-slate-500 uppercase tracking-wider">Views</p>
                          <p className="mt-0.5 text-lg font-bold text-sky-400">{latestProduct.views}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[11px] text-slate-500 uppercase tracking-wider">Wishlists</p>
                          <p className="mt-0.5 text-lg font-bold text-pink-400">{latestProduct.wishlist_count}</p>
                        </div>
                        <Link
                          href={`/vendor/products`}
                          className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-400 hover:text-white"
                          title="Manage product"
                        >
                          <ArrowUpRight size={17} />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-500 text-sm">
                      <Package className="mx-auto mb-2 text-slate-600" size={28} />
                      No products added yet. Add your first listing to view performance.
                    </div>
                  )}
                </Panel>
              </div>

              {/* Top Products & Recent Followers (Photo rows 6 & 5) */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Products */}
                <div>
                  <SectionHeading
                    eyebrow="Rankings"
                    title={`Top products (${isFree ? "Top 3" : isStandard ? "Top 5" : "All products"})`}
                    description={
                      isFree
                        ? "Limited to top 3 products on Free plan."
                        : isStandard
                        ? "Showing top 5 products on Standard plan."
                        : "Showing full catalog performance on Advanced plan."
                    }
                  />
                  <Panel className="overflow-hidden">
                    {topProducts.length === 0 ? (
                      <p className="p-6 text-center text-sm text-slate-500">No products available</p>
                    ) : (
                      <>
                        <div className="divide-y divide-white/[0.06]">
                          {topProducts.slice(0, visibleProductsCount).map((product, idx) => (
                            <div key={product.id} className="flex items-center gap-3.5 p-3.5 sm:px-5 hover:bg-white/[0.02] transition">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.05] text-xs font-bold text-slate-400">
                                #{idx + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-white">{product.title}</p>
                                <p className="text-xs text-slate-400">₹{product.price}</p>
                              </div>
                              <div className="flex items-center gap-4 text-xs">
                                <span className="text-slate-400">{product.views} views</span>
                                <span className="font-semibold text-pink-300">{product.wishlist_count} saves</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Show more / Show less controls when products exceed initial batch */}
                        {topProducts.length > 5 && (
                          <div className="border-t border-white/[0.06] bg-white/[0.015] px-4 py-3 sm:px-5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                            <span className="text-slate-400">
                              Showing <span className="font-semibold text-white">{Math.min(visibleProductsCount, topProducts.length)}</span> of{" "}
                              <span className="font-semibold text-white">{topProducts.length}</span> ranked products
                            </span>
                            <div className="flex items-center gap-2">
                              {visibleProductsCount < topProducts.length ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setVisibleProductsCount((prev) => Math.min(prev + 5, topProducts.length))}
                                    className="inline-flex items-center gap-1 rounded-lg bg-violet-600/20 px-3 py-1.5 font-medium text-violet-300 hover:bg-violet-600/30 transition"
                                  >
                                    Show more (+5) <ChevronDown size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setVisibleProductsCount(topProducts.length)}
                                    className="inline-flex items-center rounded-lg px-2.5 py-1.5 font-medium text-slate-400 hover:text-white transition"
                                  >
                                    Show all
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setVisibleProductsCount(5)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-white/[0.06] px-3 py-1.5 font-medium text-slate-300 hover:bg-white/[0.1] hover:text-white transition"
                                >
                                  Show less <ChevronUp size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </Panel>
                </div>

                {/* Recent Followers */}
                <div>
                  <SectionHeading
                    eyebrow="Community"
                    title="Recent followers"
                    description="Customers following your storefront."
                  />
                  {isFree ? (
                    <LockedFeatureOverlay
                      title="Follower insights are locked"
                      requiredPlan="Standard"
                      description="Upgrade to the Standard or Advanced plan to see your followers and community updates."
                    />
                  ) : (
                    <Panel className="p-4 sm:p-5">
                      {recentFollowers.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-sm">
                          <Users className="mx-auto mb-2 text-slate-600" size={24} />
                          No customer followers yet.
                        </div>
                      ) : (
                        <div className="divide-y divide-white/[0.06]">
                          {recentFollowers.map((f) => (
                            <div key={f.id} className="flex items-center justify-between py-2.5">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-300">
                                  {f.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-slate-200">@{f.username}</span>
                              </div>
                              <span className="text-xs text-slate-500">
                                {new Date(f.followed_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Panel>
                  )}
                </div>
              </div>

              {/* Trend Charts (Photo rows 7, 9 & 14) */}
              <div>
                <SectionHeading
                  eyebrow="Traffic & Trends"
                  title={`Trend charts (${isFree ? "Locked" : isStandard ? "7-Day" : "30/90-Day Selectable"})`}
                  description="Daily visitor and product view trajectories over time."
                  action={
                    isAdvanced && (
                      <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#0C1122] p-1">
                        {["7", "30", "90"].map((p) => (
                          <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                              period === p ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {p}d
                          </button>
                        ))}
                      </div>
                    )
                  }
                />

                {isFree ? (
                  <LockedFeatureOverlay
                    title="Trend charts are locked on Free plan"
                    requiredPlan="Standard"
                    description="Standard includes 7-day trend charts; Advanced includes 30-day and 90-day comprehensive trends."
                  />
                ) : (
                  <TrafficTrendChart
                    data={trendCharts}
                    period={period}
                    onPeriodChange={setPeriod}
                    isAdvanced={isAdvanced}
                  />
                )}
              </div>

              {/* Category Performance (Photo row 10) */}
              <div>
                <SectionHeading
                  eyebrow="Catalog Segments"
                  title="Category Performance"
                  description="Breakdown of wishlist interest and listings by category."
                />
                {isFree ? (
                  <LockedFeatureOverlay
                    title="Category Performance is locked on Free plan"
                    requiredPlan="Standard"
                    description="Upgrade to Standard or Advanced to see which merchandise categories drive customer saves."
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryPerformance.length === 0 ? (
                      <p className="col-span-full text-center text-sm text-slate-500 py-6">
                        No category data available
                      </p>
                    ) : (
                      categoryPerformance.map((cat) => (
                        <Panel key={cat.category} className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                              <Layers size={18} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{cat.category}</h4>
                              <p className="text-xs text-slate-400">{cat.product_count} listed products</p>
                            </div>
                          </div>
                          <div className="mt-4 border-t border-white/[0.07] pt-3 flex justify-between text-xs">
                            <span className="text-slate-400">Total Wishlist Saves</span>
                            <span className="font-bold text-pink-300">{cat.wishlist_saves}</span>
                          </div>
                        </Panel>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist Analytics Section (Photo rows 11-17) */}
              <div className="border-t border-white/[0.08] pt-6">
                <SectionHeading
                  eyebrow="Deeper Engagement"
                  title="Wishlist Analytics"
                  description="Customer intention, save velocity, and view-to-wishlist metrics."
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <MetricCard
                    icon={Heart}
                    label="Total wishlist saves"
                    value={data?.total_wishlist_saves ?? 0}
                    subtext="Available on all plans"
                    accent="pink"
                  />
                  <MetricCard
                    icon={TrendingUp}
                    label="View-to-wishlist rate"
                    value={data?.view_to_wishlist_rate ? `${data.view_to_wishlist_rate}%` : "—"}
                    locked={isFree}
                    requiredPlan="Standard"
                    subtext="Percentage of views converting to saves"
                    accent="emerald"
                  />
                  <MetricCard
                    icon={InstagramIcon}
                    label="Wishlist vs. Instagram DM"
                    value={wishlistVsDm ? `${wishlistVsDm.ratio}x` : "—"}
                    locked={!isAdvanced}
                    requiredPlan="Advanced"
                    subtext={wishlistVsDm?.summary || "Advanced exclusive ratio"}
                    accent="violet"
                  />
                </div>

                {/* Wishlist additions over time */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-white mb-2">
                    Wishlist additions over time ({isFree ? "Locked" : isStandard ? "7-day" : "30/90-day"})
                  </h3>
                  {isFree ? (
                    <LockedFeatureOverlay
                      title="Wishlist additions over time locked"
                      requiredPlan="Standard"
                      description="Track exactly when shoppers are saving your products with time-series charts."
                    />
                  ) : (
                    <WishlistTrendChart data={wishlistAdditions} />
                  )}
                </div>

                {/* Period Comparison (Advanced only) */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-white mb-2">
                    Compare current and previous periods
                  </h3>
                  {!isAdvanced ? (
                    <LockedFeatureOverlay
                      title="Period comparisons locked"
                      requiredPlan="Advanced"
                      description="Advanced vendors can benchmark current month against previous period performance."
                    />
                  ) : (
                    <Panel className="p-5 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                        <p className="text-xs text-slate-400">Store Visits Growth</p>
                        <p className="mt-2 text-2xl font-bold text-emerald-400">
                          +{periodComparison?.visits_growth_percent}%
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          vs {periodComparison?.previous_period_visits} last period
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                        <p className="text-xs text-slate-400">Product Views Growth</p>
                        <p className="mt-2 text-2xl font-bold text-sky-400">
                          +{periodComparison?.views_growth_percent}%
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          vs {periodComparison?.previous_period_views} last period
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                        <p className="text-xs text-slate-400">Wishlist Saves Growth</p>
                        <p className="mt-2 text-2xl font-bold text-pink-400">
                          +{periodComparison?.wishlist_growth_percent}%
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          vs {periodComparison?.previous_period_saves} last period
                        </p>
                      </div>
                    </Panel>
                  )}
                </div>
              </div>

              {/* Date comparisons and CSV Export (Photo rows 8 & 18) */}
              <div className="border-t border-white/[0.08] pt-6">
                <SectionHeading
                  eyebrow="Data Exports"
                  title="Date comparisons and CSV export"
                  description="Export full catalog performance and wishlist telemetry directly to CSV spreadsheets."
                />

                {!isAdvanced ? (
                  <LockedFeatureOverlay
                    title="CSV exports are an Advanced feature"
                    requiredPlan="Advanced"
                    description="Export full raw numbers, trends, and wishlist data in CSV format for analysis in Excel or Google Sheets."
                  />
                ) : (
                  <Panel className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-base font-semibold text-white">Download CSV Reports</h4>
                        <p className="mt-1 text-xs text-slate-400">
                          Your Advanced plan includes unlimited CSV report generation.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleExportProductsCSV}
                          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500"
                        >
                          <FileSpreadsheet size={15} />
                          Export Products CSV
                        </button>
                        <button
                          type="button"
                          onClick={handleExportWishlistCSV}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                        >
                          <Download size={15} />
                          Export Wishlist CSV
                        </button>
                      </div>
                    </div>
                  </Panel>
                )}
              </div>

              {/* Footer */}
              <footer className="flex flex-col justify-between gap-2 border-t border-white/[0.07] pt-5 text-xs text-slate-600 sm:flex-row">
                <p>InstaBazaar Seller Analysis</p>
                <p>Plan-governed storefront intelligence</p>
              </footer>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
