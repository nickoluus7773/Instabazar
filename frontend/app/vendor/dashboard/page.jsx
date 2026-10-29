
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Heart,
  Store,
  CreditCard,
  Plus,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Sparkles,
  LockKeyhole,
  AlertCircle,
  ChevronRight,
  LoaderCircle,
  Users,
  BarChart3,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
  getVendorProfile,
  getVendorStats,
  getVendorProducts,
} from "@/lib/vendorApi";
import API_BASE_URL from "@/lib/api";
import { getImageUrl } from "@/lib/imageHelper";
import ApprovalStatus from "@/app/components/vendor/ApprovalStatus";
import Navbar from "@/app/components/layout/Navbar";
import { getVendorFollowers } from "@/lib/followApi";

const navigation = [
  { id: "overview", label: "Overview", href: "/vendor/dashboard", icon: LayoutDashboard },
  { id: "analysis", label: "Analysis", href: "/vendor/analysis", icon: BarChart3 },
  { id: "products", label: "My Products", href: "/vendor/products", icon: Package },
  {
    id: "wishlist",
    label: "Wishlist Analytics",
    href: "/vendor/dashboard?tab=wishlist",
    icon: Heart,
  },
  { id: "profile", label: "Store Profile", href: "/vendor/profile", icon: Store },
  { id: "followers", label: "Followers", href: "/vendor/dashboard?tab=followers", icon: Users },
  { id: "subscription", label: "Subscription", href: "/subscription", icon: CreditCard },
];

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getProductTitle = (product) =>
  product?.productTitle || product?.title || "Untitled product";

const getProductPrice = (product) =>
  product?.productPrice ?? product?.price ?? 0;

const getProductImage = (product) => {
  return getImageUrl(product?.productImage || product?.image);
};

const getPlanName = (plan, stats) => {
  if (plan?.name) return plan.name;
  if (stats?.plan_name) return stats.plan_name;

  const code = (plan?.code || stats?.plan_code || "").toLowerCase();
  if (code === "advanced") return "Advanced";
  if (code === "standard") return "Standard";
  if (code === "free") return "Free";

  const limit = plan?.max_products !== undefined ? plan?.max_products : stats?.max_products;
  if (limit === null) return "Advanced";
  if (limit !== undefined && Number(limit) >= 50) return "Standard";
  return "Free";
};

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

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
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
            {eyebrow}
          </p>
        )}
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function SmallLink({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-300 transition hover:text-white"
    >
      {children}
      <ChevronRight size={15} />
    </Link>
  );
}

function MetricCard({ icon: Icon, label, value, detail, accent = "violet" }) {
  const accents = {
    violet: "bg-violet-500/15 text-violet-300",
    pink: "bg-pink-500/15 text-pink-300",
    blue: "bg-sky-500/15 text-sky-300",
  };

  return (
    <Panel className="p-5 transition hover:border-violet-400/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 break-words text-3xl font-semibold tracking-tight text-white">
            {value}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            accents[accent] || accents.violet
          }`}
        >
          <Icon size={21} />
        </div>
      </div>
      {detail && <p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p>}
    </Panel>
  );
}

function FollowersSection() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async (nextPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const result = await getVendorFollowers(localStorage.getItem("accessToken"), nextPage);
      setData(result);
      setPage(nextPage);
    } catch (cause) {
      setError(cause.message || "Could not load followers.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const followers = data?.results || [];
  return (
    <div id="followers" className="space-y-4">
      <Panel className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Total Followers</p>
            <p className="mt-1 text-3xl font-bold text-white">{data?.count ?? (loading ? "…" : 0)}</p>
          </div>
          {!loading && data?.eligible === false && (
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs text-amber-300">
              Follower insights are unlocked on Standard or Advanced subscription.
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-rose-300">
            {error} <button onClick={() => load(page)} className="underline font-semibold ml-2">Retry</button>
          </p>
        )}

        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400">
            <LoaderCircle className="mx-auto mb-2 animate-spin text-violet-400" size={24} />
            Loading followers...
          </div>
        ) : followers.length ? (
          <div className="mt-4 divide-y divide-white/[0.07]">
            {followers.map((follower) => (
              <div key={follower.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-bold text-violet-300">
                    {(follower.username || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">@{follower.username}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(follower.followed_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          !error && (
            <div className="py-12 text-center text-sm text-slate-400">
              <Users className="mx-auto mb-2 text-slate-600" size={32} />
              No followers yet. Shoppers will appear here when they follow your storefront.
            </div>
          )
        )}

        {!loading && (data?.previous || data?.next) && (
          <div className="mt-5 flex justify-between border-t border-white/[0.07] pt-4">
            <button
              disabled={!data.previous}
              onClick={() => load(page - 1)}
              className="rounded-lg bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-violet-300 transition hover:bg-white/[0.1] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={!data.next}
              onClick={() => load(page + 1)}
              className="rounded-lg bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-violet-300 transition hover:bg-white/[0.1] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
}

export default function VendorDashboard() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();

  const [vendor, setVendor] = useState(null);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [wishlist, setWishlist] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [wishlistLocked, setWishlistLocked] = useState(false);
  const [wishlistError, setWishlistError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const syncTabFromUrl = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab");
        const hash = window.location.hash;
        if (tab === "wishlist" || hash === "#wishlist-analytics" || hash === "#wishlist") {
          setActiveTab("wishlist");
        } else if (tab === "followers" || hash === "#followers") {
          setActiveTab("followers");
        } else {
          setActiveTab("overview");
        }
      }
    };

    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);
    window.addEventListener("hashchange", syncTabFromUrl);
    return () => {
      window.removeEventListener("popstate", syncTabFromUrl);
      window.removeEventListener("hashchange", syncTabFromUrl);
    };
  }, []);

  const fetchDashboardData = useCallback(async (showRefresh = false) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (!token) {
      setLoading(false);
      router.replace("/login");
      return;
    }

    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    const requests = await Promise.allSettled([
      getVendorProfile(token),
      getVendorStats(token),
      getVendorProducts(token, 1, 5),
      fetch(`${API_BASE_URL}/subscriptions/current/`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.detail || "Subscription unavailable");
        return data;
      }),
      fetch(`${API_BASE_URL}/api/vendor/wishlist-analysis/`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }).then(async (response) => {
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const err = new Error(
            data.detail || data.message || "Wishlist analytics unavailable"
          );
          err.status = response.status;
          err.code = data.code;
          throw err;
        }

        return data;
      }),
    ]);

    const [profileResult, statsResult, productsResult, subscriptionResult, wishlistResult] =
      requests;

    if (profileResult.status === "fulfilled") {
      setVendor(profileResult.value);
    } else {
      setVendor(null);
      const isAuthError =
        profileResult.reason?.message === "Unauthorized" ||
        profileResult.reason?.message?.includes("401");
      if (isAuthError) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
        router.replace("/login");
        return;
      }
      setError(
        profileResult.reason?.message ||
          "Could not load your vendor profile. Please try again."
      );
    }

    if (statsResult.status === "fulfilled") {
      setStats(statsResult.value);
    } else {
      setStats(null);
    }

    if (productsResult.status === "fulfilled") {
      const responseData = productsResult.value;
      const rows = Array.isArray(responseData)
        ? responseData
        : responseData?.results || [];

      setProducts(rows);
      setProductCount(
        Number(
          responseData?.count ??
            statsResult.value?.total_products ??
            rows.length
        )
      );
    } else {
      setProducts([]);
      setProductCount(
        Number(
          statsResult.status === "fulfilled"
            ? statsResult.value?.total_products || 0
            : 0
        )
      );
    }

    if (subscriptionResult.status === "fulfilled") {
      setSubscriptionData(subscriptionResult.value);
    } else {
      setSubscriptionData(null);
    }

    if (wishlistResult.status === "fulfilled") {
      setWishlist(wishlistResult.value);
      setWishlistLocked(false);
      setWishlistError("");
    } else {
      const reason = wishlistResult.reason;
      const isPlanRestriction =
        reason?.status === 403 ||
        reason?.code === "ANALYTICS_UPGRADE_REQUIRED";

      setWishlist(null);
      setWishlistLocked(isPlanRestriction);
      setWishlistError(
        isPlanRestriction
          ? ""
          : reason?.message || "Could not load wishlist analytics."
      );
    }

    setLoading(false);
    setRefreshing(false);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => fetchDashboardData(), 0);

    // Re-fetch if the vendor returns to this dashboard.
    return () => window.clearTimeout(timer);
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!isLoggedIn && !localStorage.getItem("accessToken")) {
      // AuthContext handles session state. The dashboard redirects if
      // the token is missing in fetchDashboardData.
    }
  }, [isLoggedIn]);

  const plan = subscriptionData?.plan || null;
  const subscription = subscriptionData?.subscription || null;

  const planCode = (plan?.code || subscription?.plan?.code || stats?.plan_code || "free").toLowerCase();
  const planName = getPlanName(plan, stats);

  const rawMax = stats?.max_products !== undefined ? stats?.max_products : plan?.max_products;
  const isUnlimited = planCode === "advanced" || rawMax === null;
  const productLimit = isUnlimited
    ? null
    : (rawMax !== undefined && rawMax !== null
        ? Number(rawMax)
        : (planCode === "standard" ? 50 : 10));

  const totalProducts = Number(stats?.total_products ?? productCount ?? 0);
  const usagePercent =
    isUnlimited || !productLimit
      ? 0
      : Math.min(100, Math.round((totalProducts / productLimit) * 100));

  const analyticsLevel =
    stats?.analytics_level || plan?.analytics_level || "basic";
  const isAdvanced = analyticsLevel === "advanced";
  const canViewWishlistAnalytics = analyticsLevel !== "basic";

  const storeName =
    vendor?.business_name ||
    vendor?.store_name ||
    vendor?.name ||
    "Your Store";

  const instagramHandle = vendor?.instagram_handle
    ? vendor.instagram_handle.replace(/^@/, "")
    : "";

  const verificationStatus = String(
    vendor?.verification_status || "pending"
  ).toLowerCase();

  const activeProductsCount = Number(
  stats?.active_products ?? stats?.total_active_products ?? 0
);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[75vh] items-center justify-center bg-[#090D1A] px-4 text-white">
          <div className="text-center">
            <LoaderCircle
              className="mx-auto animate-spin text-violet-400"
              size={34}
            />
            <p className="mt-4 text-sm text-slate-400">
              Loading your storefront...
            </p>
          </div>
        </main>
      </>
    );
  }

  if (!vendor) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[75vh] items-center justify-center bg-[#090D1A] px-4 text-white">
          <Panel className="w-full max-w-lg p-8 text-center">
            <Store className="mx-auto text-violet-300" size={38} />
            <h1 className="mt-4 text-2xl font-semibold">Store profile unavailable</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              We could not retrieve your vendor profile. Check that your
              backend is running and that your account has a vendor profile.
            </p>
            {error && (
              <p className="mt-3 break-words text-sm text-rose-300">{error}</p>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => fetchDashboardData()}
                className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
              >
                Try again
              </button>
              <Link
                href="/register/vendor"
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5"
              >
                Create vendor profile
              </Link>
            </div>
          </Panel>
        </main>
      </>
    );
  }

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
                {navigation.map(({ id, label, href, icon: Icon }) => {
                  const isTabActive =
                    (id === "overview" && activeTab === "overview") ||
                    (id === "wishlist" && activeTab === "wishlist") ||
                    (id === "followers" && activeTab === "followers");

                  return (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => {
                        if (id === "overview") {
                          setActiveTab("overview");
                          if (typeof window !== "undefined") window.history.pushState(null, "", "/vendor/dashboard");
                        } else if (id === "wishlist") {
                          setActiveTab("wishlist");
                          if (typeof window !== "undefined") window.history.pushState(null, "", "/vendor/dashboard?tab=wishlist");
                        } else if (id === "followers") {
                          setActiveTab("followers");
                          if (typeof window !== "undefined") window.history.pushState(null, "", "/vendor/dashboard?tab=followers");
                        }
                      }}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                        isTabActive
                          ? "bg-violet-500/15 font-medium text-violet-200 ring-1 ring-violet-400/20"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <Icon size={18} />
                      <span>{label}</span>
                      {id === "followers" && (
                        <span className="ml-auto rounded-md bg-white/[0.06] px-2 py-1 text-[10px] text-slate-300">
                          {stats?.total_followers ?? stats?.follower_count ?? vendor?.follower_count ?? 0}
                        </span>
                      )}
                      {label === "Subscription" && (
                        <span className="ml-auto rounded-md bg-white/[0.06] px-2 py-1 text-[10px] text-slate-300">
                          {planName}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 rounded-xl border border-violet-400/15 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-4">
                <div className="flex items-center gap-2 text-violet-200">
                  <Sparkles size={17} />
                  <span className="text-sm font-semibold">Grow your store</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Explore plans to unlock more listings and deeper customer
                  insights.
                </p>
                <Link
                  href="/subscription"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-white"
                >
                  View plans <ArrowUpRight size={14} />
                </Link>
              </div>
            </aside>

            {/* Main content */}
            <div className="min-w-0 space-y-6">
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                  <AlertCircle className="mt-0.5 shrink-0" size={18} />
                  <p>{error}</p>
                </div>
              )}

              {/* ===================== TAB: OVERVIEW ===================== */}
              {activeTab === "overview" && (
                <>
                  {/* Header */}
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                        <span>Seller workspace</span>
                        <ChevronRight size={13} />
                        <span className="text-violet-300">Overview</span>
                      </div>
                      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Welcome back, {storeName}
                      </h1>
                      <p className="mt-2 text-sm text-slate-400">
                        Manage your storefront and understand what shoppers are
                        saving.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => fetchDashboardData(true)}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.07] disabled:opacity-50"
                      >
                        <RefreshCw
                          size={16}
                          className={refreshing ? "animate-spin" : ""}
                        />
                        Refresh
                      </button>
                      <Link
                        href="/vendor/products/create"
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500"
                      >
                        <Plus size={17} />
                        Add product
                      </Link>
                    </div>
                  </div>

                  {/* Store status */}
                  <Panel className="overflow-hidden">
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#1B2140] text-xl font-semibold text-violet-200">
                          {vendor?.logo_url || vendor?.logo ? (
                            <img
                              src={getImageUrl(vendor.logo_url || vendor.logo)}
                              alt={`${storeName} logo`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            storeName.charAt(0).toUpperCase()
                          )}
                        </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-lg font-semibold">{storeName}</h2>
                        {verificationStatus === "verified" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                            <ShieldCheck size={13} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                            <Clock3 size={13} />{" "}
                            {verificationStatus === "rejected"
                              ? "Verification rejected"
                              : "Verification pending"}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-2 truncate text-sm text-slate-400">
                        <span className="inline-flex items-center gap-1 font-medium text-fuchsia-300">
                          <Users size={14} /> {stats?.total_followers ?? stats?.follower_count ?? vendor?.follower_count ?? 0} followers
                        </span>
                        <span>•</span>
                        <span>
                          {instagramHandle
                            ? `@${instagramHandle}`
                            : "Add your Instagram handle to complete your storefront."}
                        </span>
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/vendor/profile"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/[0.05]"
                  >
                    Edit profile <ArrowUpRight size={15} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 border-t border-white/[0.07] sm:grid-cols-3">
                  <div className="p-4 sm:px-6">
                    <p className="text-xs text-slate-500">Current plan</p>
                    <p className="mt-1 font-semibold text-white">{planName}</p>
                  </div>
                  <div className="border-t border-white/[0.07] p-4 sm:border-l sm:border-t-0 sm:px-6">
                    <p className="text-xs text-slate-500">Subscription status</p>
                    <p className="mt-1 font-semibold capitalize text-white">
                      {subscription?.is_cancelled ? (
                        <span className="text-amber-300">
                          Cancelled ({subscription.days_remaining ?? 0}d left)
                        </span>
                      ) : (
                        subscription?.status || "Free plan"
                      )}
                    </p>
                  </div>
                  <div className="border-t border-white/[0.07] p-4 sm:border-l sm:border-t-0 sm:px-6">
                    <p className="text-xs text-slate-500">Plan expires</p>
                    <p className="mt-1 font-semibold text-white">
                      {subscription?.expires_at
                        ? formatDate(subscription.expires_at)
                        : "No expiry date"}
                    </p>
                  </div>
                </div>
              </Panel>

              {/* Real metrics only */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  icon={Package}
                  label="Total products"
                  value={totalProducts}
                  detail={
                    isUnlimited
                      ? "Unlimited listings on your current plan"
                      : `${Math.max(0, productLimit - totalProducts)} listing${
                          productLimit - totalProducts === 1 ? "" : "s"
                        } remaining on your plan`
                  }
                  accent="violet"
                />
                <MetricCard
                  icon={Heart}
                  label="Wishlist saves"
                  value={
                    stats?.total_favorites === null ||
                    stats?.total_favorites === undefined
                      ? "—"
                      : stats.total_favorites
                  }
                  detail="Total favorites recorded for your products"
                  accent="pink"
                />
                <MetricCard
                  icon={Store}
                  label="Active listings"
                  value={stats?.active_products ?? stats?.total_active_products ?? "—"}
                  detail="Total active listings reported by the backend"
                  accent="blue"
                />
                <MetricCard
                  icon={Users}
                  label="Total followers"
                  value={stats?.total_followers ?? stats?.follower_count ?? vendor?.follower_count ?? 0}
                  detail="Shoppers actively following your storefront"
                  accent="emerald"
                />
              </div>

              {/* Plan usage */}
              <Panel className="p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
                      Your plan
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                      {planName} membership
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {isUnlimited
                        ? "Your plan has no product listing limit."
                        : `You can list up to ${productLimit} products on this plan.`}
                    </p>
                  </div>
                  <Link
                    href="/subscription"
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20"
                  >
                    Manage subscription <ArrowUpRight size={16} />
                  </Link>
                </div>

                {isUnlimited ? (
                  <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                      <CheckCircle2 size={17} />
                      <span>Unlimited product listings</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-300">
                      Your current plan allows unlimited products. You have {totalProducts} active product listings.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-300">Product usage</span>
                      <span className="text-slate-400">
                        {totalProducts} / {productLimit}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usagePercent >= 100
                            ? "bg-rose-400"
                            : "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                    {totalProducts >= productLimit && (
                      <p className="mt-3 text-sm text-rose-300">
                        You have reached your product limit ({productLimit} products). Additional products are kept in your dashboard in grey. Upgrade to add more active listings.
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-6 grid gap-3 border-t border-white/[0.07] pt-5 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                    Product listings
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                    {analyticsLevel === "basic"
                      ? "Basic analytics"
                      : analyticsLevel === "advanced"
                      ? "Advanced analytics"
                      : "Standard analytics"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    {plan?.instagram_redirect ? (
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                    ) : (
                      <LockKeyhole size={16} className="shrink-0 text-slate-500" />
                    )}
                    Instagram redirect
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    {plan?.ai_tools ? (
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                    ) : (
                      <LockKeyhole size={16} className="shrink-0 text-slate-500" />
                    )}
                    AI tools
                  </div>
                </div>
              </Panel>

              {/* Product listings */}
              <div>
                <SectionHeading
                  eyebrow="Your storefront"
                  title="Recent products"
                  description="The latest products in your catalog."
                  action={
                    <SmallLink href="/vendor/products">
                      View all products
                    </SmallLink>
                  }
                />

                <Panel className="overflow-hidden">
                  {products.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                        <Package size={25} />
                      </div>
                      <h3 className="mt-4 font-semibold text-white">
                        Your catalog is empty
                      </h3>
                      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                        Add your first product to start building your
                        storefront on InstaBazaar.
                      </p>
                      <Link
                        href="/vendor/products/create"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold hover:bg-violet-500"
                      >
                        <Plus size={16} /> Add your first product
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.06]">
                      {products.map((product, index) => {
                        const image = getProductImage(product);
                        const isLocked = product.is_plan_locked || (!isUnlimited && productLimit !== null && index >= productLimit);
                        const active = !isLocked && product.is_active !== false;

                        return (
                          <div
                            key={product.id}
                            className={`flex items-center gap-3 p-4 transition sm:gap-4 sm:px-5 ${
                              isLocked
                                ? "bg-slate-900/50 opacity-60 grayscale hover:opacity-80"
                                : "hover:bg-white/[0.02]"
                            }`}
                          >
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/[0.07] bg-[#1A2037]">
                              {image ? (
                                <img
                                  src={image}
                                  alt={getProductTitle(product)}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-slate-600">
                                  <Package size={21} />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className={`truncate text-sm font-medium ${isLocked ? "text-slate-400" : "text-white"}`}>
                                  {getProductTitle(product)}
                                </p>
                                {isLocked && (
                                  <span className="shrink-0 rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 border border-slate-700">
                                    Greyed (Plan limit)
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-slate-400">
                                {money(getProductPrice(product))}
                              </p>
                            </div>

                            <span
                              className={`hidden rounded-full px-2.5 py-1 text-xs sm:inline-flex ${
                                isLocked
                                  ? "bg-slate-800 text-slate-400 border border-slate-700"
                                  : active
                                  ? "bg-emerald-400/10 text-emerald-300"
                                  : "bg-slate-400/10 text-slate-400"
                              }`}
                            >
                              {isLocked ? "Limit exceeded" : active ? "Active" : "Inactive"}
                            </span>

                            <Link
                              href="/vendor/products"
                              aria-label={`Manage ${getProductTitle(product)}`}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-violet-400/30 hover:text-white"
                            >
                              <ArrowUpRight size={17} />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Panel>
              </div>

                  {/* Quick actions */}
                  <div>
                    <SectionHeading
                      title="Quick actions"
                      description="Shortcuts to the parts of your store you use most."
                    />
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <Link
                        href="/vendor/products"
                        className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-[#11162A] p-5 transition hover:border-violet-400/30 hover:bg-[#151B32]"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                          <Package size={21} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white">Manage products</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Edit or remove listings
                          </p>
                        </div>
                        <ArrowUpRight
                          size={17}
                          className="text-slate-500 transition group-hover:text-violet-300"
                        />
                      </Link>

                      <Link
                        href="/vendor/profile"
                        className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-[#11162A] p-5 transition hover:border-violet-400/30 hover:bg-[#151B32]"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                          <Store size={21} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white">Store profile</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Update your public details
                          </p>
                        </div>
                        <ArrowUpRight
                          size={17}
                          className="text-slate-500 transition group-hover:text-violet-300"
                        />
                      </Link>

                      <Link
                        href="/subscription"
                        className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-[#11162A] p-5 transition hover:border-violet-400/30 hover:bg-[#151B32]"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-300">
                          <CreditCard size={21} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white">Manage plan</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Review features and limits
                          </p>
                        </div>
                        <ArrowUpRight
                          size={17}
                          className="text-slate-500 transition group-hover:text-violet-300"
                        />
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {/* ===================== TAB: WISHLIST ANALYTICS ===================== */}
              {activeTab === "wishlist" && (
                <div className="space-y-6">
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                        <span>Seller workspace</span>
                        <ChevronRight size={13} />
                        <span className="text-violet-300">Wishlist Analytics</span>
                      </div>
                      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Wishlist Analytics
                      </h1>
                      <p className="mt-2 text-sm text-slate-400">
                        Product-level customer intention, save metrics, and shopper interest.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href="/vendor/analysis"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.07]"
                      >
                        <BarChart3 size={16} /> View Trend Charts
                      </Link>
                      <Link
                        href="/subscription"
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500"
                      >
                        View plans <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  </div>

                  {/* Wishlist content */}
                  <div id="wishlist-analytics">
                    {wishlistLocked || !canViewWishlistAnalytics ? (
                      <Panel className="relative overflow-hidden p-6 sm:p-8">
                        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
                        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                            <LockKeyhole size={25} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">
                              Unlock product-level insights
                            </h3>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                              Wishlist analytics require the Standard or Advanced
                              plan. Upgrade to see which products attract customer
                              interest. Advanced includes customer-level wishlist
                              insights when available.
                            </p>
                          </div>
                          <Link
                            href="/subscription"
                            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold hover:bg-violet-500"
                          >
                            Explore plans <ArrowUpRight size={16} />
                          </Link>
                        </div>
                      </Panel>
                    ) : wishlistError ? (
                      <Panel className="p-5">
                        <div className="flex items-start gap-3 text-sm text-amber-200">
                          <AlertCircle size={18} className="mt-0.5 shrink-0" />
                          <div>
                            <p>{wishlistError}</p>
                            <button
                              onClick={() => fetchDashboardData(true)}
                              className="mt-3 font-medium text-violet-300 hover:text-white"
                            >
                              Retry
                            </button>
                          </div>
                        </div>
                      </Panel>
                    ) : (
                      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
                        <Panel className="p-5 sm:p-6">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm text-slate-400">
                                Total wishlist saves
                              </p>
                              <p className="mt-3 text-4xl font-semibold text-white">
                                {wishlist?.total_wishlist_saves ?? 0}
                              </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 text-pink-300">
                              <Heart size={22} />
                            </div>
                          </div>
                          {isAdvanced && (
                            <div className="mt-5 border-t border-white/[0.07] pt-4">
                              <p className="text-sm text-slate-400">
                                Unique wishlist customers
                              </p>
                              <p className="mt-2 text-2xl font-semibold text-white">
                                {wishlist?.total_customers ?? 0}
                              </p>
                            </div>
                          )}
                        </Panel>

                        <Panel className="p-5 sm:p-6">
                          <h3 className="font-semibold text-white">
                            Most wishlisted products
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            Based on recorded wishlist activity
                          </p>

                          {wishlist?.products?.length ? (
                            <div className="mt-4 space-y-3">
                              {[...wishlist.products]
                                .sort(
                                  (a, b) =>
                                    Number(b.wishlist_count || 0) -
                                    Number(a.wishlist_count || 0)
                                )
                                .slice(0, 8)
                                .map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-3 rounded-xl bg-white/[0.025] p-3"
                                  >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pink-500/10 text-pink-300">
                                      <Heart size={16} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-medium text-slate-200">
                                        {item.title || "Untitled product"}
                                      </p>
                                      {isAdvanced && (
                                        <p className="mt-1 text-xs text-slate-500">
                                          {item.customer_count ?? 0} unique customers
                                        </p>
                                      )}
                                    </div>
                                    <p className="shrink-0 text-sm font-semibold text-white">
                                      {item.wishlist_count ?? 0} saves
                                    </p>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="py-8 text-center">
                              <Heart className="mx-auto text-slate-600" size={25} />
                              <p className="mt-3 text-sm text-slate-400">
                                No wishlist activity recorded yet.
                              </p>
                            </div>
                          )}
                        </Panel>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ===================== TAB: FOLLOWERS ===================== */}
              {activeTab === "followers" && (
                <div className="space-y-6">
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                        <span>Seller workspace</span>
                        <ChevronRight size={13} />
                        <span className="text-violet-300">Followers</span>
                      </div>
                      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Vendor Community & Followers
                      </h1>
                      <p className="mt-2 text-sm text-slate-400">
                        Shoppers who follow your storefront to receive new product alerts in their feed.
                      </p>
                    </div>

                    {vendor?.store_slug && (
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/vendors/${vendor.store_slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.07]"
                        >
                          <ExternalLink size={16} /> View Public Store
                        </Link>
                      </div>
                    )}
                  </div>

                  <FollowersSection />
                </div>
              )}

              <footer className="flex flex-col justify-between gap-2 border-t border-white/[0.07] pt-5 text-xs text-slate-600 sm:flex-row">
                <p>InstaBazaar Seller Workspace</p>
                <p>Storefront tools and customer-interest insights</p>
              </footer>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
