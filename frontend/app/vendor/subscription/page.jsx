"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock3,
  Crown,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  XCircle,
  Zap,
  CalendarDays,
  CreditCard,
  Package,
  BarChart3,
  Instagram,
  BadgeCheck,
  CircleAlert,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import API_BASE_URL from "@/lib/api";
import Navbar from "@/app/components/layout/Navbar";

const PLAN_DETAILS = {
  free: {
    description: "Everything you need to start selling.",
    icon: Package,
    accent: "from-slate-700/40 to-slate-800/10",
    border: "border-slate-700/70",
  },
  standard: {
    description: "More room to grow your product catalog.",
    icon: Zap,
    accent: "from-purple-600/25 to-violet-900/10",
    border: "border-purple-500/50",
  },
  advanced: {
    description: "Premium tools for growing businesses.",
    icon: Crown,
    accent: "from-fuchsia-600/20 to-purple-900/20",
    border: "border-fuchsia-500/40",
  },
};

const STATUS_LABELS = {
  active: "Active",
  pending: "Pending verification",
  expired: "Expired",
  cancelled: "Cancelled",
};

function formatPrice(price) {
  return Number(price) === 0
    ? "Free"
    : `₹${Number(price).toLocaleString("en-IN")}/month`;
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.detail ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

async function apiRequest(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok && response.status !== 202) {
    throw new Error(
      data.detail ||
        data.message ||
        "Unable to complete the request."
    );
  }

  return { data, status: response.status };
}

function Feature({ included, children }) {
  return (
    <li className="flex items-start gap-3 text-sm leading-6 text-slate-300">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          included
            ? "bg-emerald-500/15 text-emerald-400"
            : "bg-slate-800 text-slate-500"
        }`}
      >
        {included ? <Check size={13} /> : <XCircle size={13} />}
      </span>
      <span>{children}</span>
    </li>
  );
}

function getFeatures(plan) {
  return [
    {
      label:
        plan.max_products == null
          ? "Unlimited product listings"
          : `${plan.max_products} product listings`,
      included: true,
    },
    {
      label: `${plan.analytics_level} analytics`,
      included: true,
    },
    {
      label: "Instagram redirect",
      included: plan.instagram_redirect,
    },
    {
      label: "Product badges",
      included: plan.product_badges,
    },
    {
      label: "AI tools",
      included: plan.ai_tools,
    },
    {
      label: "Bazaar Choice",
      included: plan.bazaar_choice,
    },
  ];
}

export default function VendorSubscriptionPage() {
  const { isLoggedIn, isVendor } = useAuth();

  const [plans, setPlans] = useState([]);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingPlan, setRequestingPlan] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSubscriptionData = useCallback(async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (!token) {
      setLoading(false);
      setError("Please log in to manage your subscription.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [plansResult, currentResult, historyResult] =
        await Promise.all([
          fetch(`${API_BASE_URL}/subscriptions/plans/`).then(
            async (res) => {
              if (!res.ok) {
                throw new Error("Unable to load subscription plans.");
              }
              return res.json();
            }
          ),
          apiRequest("/subscriptions/current/", token),
          apiRequest("/subscriptions/history/", token),
        ]);

      setPlans(Array.isArray(plansResult) ? plansResult : []);
      setCurrent(currentResult.data);
      setHistory(
        Array.isArray(historyResult.data)
          ? historyResult.data
          : []
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && isVendor) {
      loadSubscriptionData();
    } else if (!isLoggedIn) {
      setLoading(false);
    }
  }, [isLoggedIn, isVendor, loadSubscriptionData]);

  async function handleSubscribe(plan) {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setRequestingPlan(plan.code);
    setError("");
    setNotice("");

    try {
      const result = await apiRequest(
        "/subscriptions/subscribe/",
        token,
        {
          method: "POST",
          body: JSON.stringify({ plan_code: plan.code }),
        }
      );

      setNotice(
        result.data.message ||
          (result.status === 202
            ? "Your request is pending payment verification."
            : "Your subscription request was processed.")
      );

      await loadSubscriptionData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRequestingPlan(null);
    }
  }

  const currentPlanCode = current?.plan?.code?.toLowerCase();

  if (!isLoggedIn) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[70vh] items-center justify-center bg-[#080D1B] px-4 text-white">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#111629] p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
              <Crown size={30} className="text-purple-300" />
            </div>
            <h1 className="mt-5 text-2xl font-bold">
              Manage your subscription
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Log in to view your current plan and manage subscription
              requests.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500"
            >
              Log in
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#080D1B] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <Link
            href="/vendor/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </Link>

          <header className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3.5 py-2 text-xs font-semibold text-purple-300">
                <Sparkles size={14} />
                SELLER WORKSPACE
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Subscription management
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Manage your plan, explore seller features, and track
                subscription requests in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={loadSubscriptionData}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#111629] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-purple-500/50 hover:bg-[#171D32] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </header>

          {!isVendor && (
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm leading-6 text-amber-200">
              <CircleAlert size={20} className="mt-0.5 shrink-0" />
              <p>
                A vendor profile is required to manage a subscription.
                If you recently registered as a vendor, refresh this
                page after your account has loaded.
              </p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm leading-6 text-red-300"
            >
              <CircleAlert size={19} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-300"
            >
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
              <p>{notice}</p>
            </div>
          )}

          {isVendor && loading && !current && (
            <div className="mt-8 flex min-h-48 items-center justify-center gap-3 rounded-3xl border border-slate-800 bg-[#111629] text-slate-400">
              <LoaderCircle size={22} className="animate-spin text-purple-400" />
              Loading subscription details...
            </div>
          )}

          {isVendor && current && (
            <section className="mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-[#111629]">
              <div className="border-b border-slate-800 bg-gradient-to-r from-purple-950/70 via-[#17152D] to-[#111629] px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10">
                    <ShieldCheck size={22} className="text-purple-300" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Your current plan</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Your effective subscription and account status
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-7">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    CURRENT EFFECTIVE PLAN
                  </p>
                  <h3 className="mt-3 text-3xl font-bold capitalize">
                    {current.plan?.name || "Free"}
                  </h3>
                  <p className="mt-2 text-lg font-semibold text-purple-300">
                    {current.plan
                      ? formatPrice(Number(current.plan.monthly_price))
                      : "Free"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#0C1222] p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Subscription status
                  </p>
                  <p className="mt-3 flex items-center gap-2 font-semibold text-slate-100">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        current.subscription?.is_current
                          ? "bg-emerald-400"
                          : current.subscription?.status === "pending"
                            ? "bg-amber-400"
                            : "bg-slate-500"
                      }`}
                    />
                    {current.subscription
                      ? STATUS_LABELS[current.subscription.status] ||
                        current.subscription.status
                      : "Free plan"}
                  </p>

                  {current.subscription?.expires_at && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                      <CalendarDays size={15} />
                      Expires {formatDate(current.subscription.expires_at)}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {isVendor && (
            <section className="mt-12">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-300">
                  FIND YOUR FIT
                </p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  Available plans
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Choose the plan that fits your business. Paid upgrades
                  remain pending until payment is verified.
                </p>
              </div>

              {!loading && plans.length === 0 && !error && (
                <div className="rounded-2xl border border-slate-800 bg-[#111629] p-6 text-sm text-slate-400">
                  No active plans are available right now.
                </div>
              )}

              <div className="grid items-stretch gap-5 lg:grid-cols-3">
                {plans.map((plan) => {
                  const code = plan.code?.toLowerCase();
                  const details =
                    PLAN_DETAILS[code] || PLAN_DETAILS.free;
                  const PlanIcon = details.icon;
                  const isCurrent = currentPlanCode === code;
                  const features = getFeatures(plan);
                  const isRequesting = requestingPlan === plan.code;

                  return (
                    <article
                      key={plan.id}
                      className={`relative flex flex-col overflow-hidden rounded-3xl border bg-[#111629] transition duration-200 hover:-translate-y-1 hover:border-purple-500/40 ${details.border} ${
                        code === "standard"
                          ? "shadow-[0_0_35px_rgba(124,34,255,0.08)]"
                          : ""
                      }`}
                    >
                      <div
                        className={`border-b border-slate-800 bg-gradient-to-br ${details.accent} p-6`}
                      >
                        {code === "standard" && (
                          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-purple-400/30 bg-purple-500/15 px-3 py-1.5 text-[10px] font-bold tracking-wider text-purple-200">
                            <Sparkles size={12} />
                            MOST POPULAR
                          </span>
                        )}

                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/20 bg-[#111629]/80">
                            <PlanIcon
                              size={23}
                              className="text-purple-300"
                            />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">
                              {plan.name}
                            </h3>
                            <p className="mt-1 text-xs text-slate-400">
                              {details.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 flex items-baseline gap-1.5">
                          <span className="text-3xl font-bold tracking-tight">
                            {formatPrice(Number(plan.monthly_price))}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                          PLAN FEATURES
                        </p>

                        <ul className="mt-5 flex-1 space-y-4">
                          {features.map((feature) => (
                            <Feature
                              key={feature.label}
                              included={feature.included}
                            >
                              {feature.label}
                            </Feature>
                          ))}
                        </ul>

                        <button
                          type="button"
                          disabled={Boolean(requestingPlan) || isCurrent || loading}
                          onClick={() => handleSubscribe(plan)}
                          className={`mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            isCurrent
                              ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                              : "bg-purple-600 text-white hover:bg-purple-500"
                          }`}
                        >
                          {isRequesting ? (
                            <>
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                              Processing...
                            </>
                          ) : isCurrent ? (
                            <>
                              <Check size={17} />
                              Current plan
                            </>
                          ) : code === "free" ? (
                            "Select Free"
                          ) : (
                            <>
                              <CreditCard size={16} />
                              Request upgrade
                            </>
                          )}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {isVendor && (
            <section className="mt-14">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-300">
                  YOUR ACCOUNT
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  Subscription history
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Review previous plans and pending requests.
                </p>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-800 bg-[#111629]">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center px-5 py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50">
                      <Clock3 size={22} className="text-slate-400" />
                    </div>
                    <h3 className="mt-4 font-semibold">
                      No subscription history yet
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Your subscription requests will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10">
                            <CreditCard
                              size={19}
                              className="text-purple-300"
                            />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-100">
                              {item.plan?.name || "Subscription"}
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              Requested {formatDate(item.created_at)}
                            </p>
                            {item.expires_at && (
                              <p className="mt-1 text-xs text-slate-500">
                                Expires {formatDate(item.expires_at)}
                              </p>
                            )}
                          </div>
                        </div>

                        <span
                          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                            item.status === "active"
                              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                              : item.status === "pending"
                                ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
                                : "border-slate-700 bg-slate-800/70 text-slate-300"
                          }`}
                        >
                          {item.status === "pending" ? (
                            <Clock3 size={13} />
                          ) : (
                            <ShieldCheck size={13} />
                          )}
                          {STATUS_LABELS[item.status] || item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          <footer className="mt-12 flex flex-col gap-2 border-t border-slate-800 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>InstaBazaar Seller Workspace</span>
            <span>Subscription settings</span>
          </footer>
        </div>
      </main>
    </>
  );
}
