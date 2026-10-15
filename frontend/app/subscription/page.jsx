
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/layout/Navbar";
import {
  ArrowRight,
  Check,
  Crown,
  LoaderCircle,
  LockKeyhole,
  Rocket,
  Sparkles,
  Store,
  Zap,
  X,
} from "lucide-react";

import API_BASE_URL from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const planStyles = {
  free: {
    icon: Store,
    accent: "from-slate-400 to-slate-200",
    glow: "group-hover:shadow-slate-500/10",
  },
  standard: {
    icon: Zap,
    accent: "from-purple-500 to-pink-500",
    glow: "group-hover:shadow-fuchsia-500/20",
  },
  advanced: {
    icon: Crown,
    accent: "from-amber-300 to-orange-500",
    glow: "group-hover:shadow-amber-500/20",
  },
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(price ?? 0));

function getFeatures(plan) {
  const limit =
    plan.max_products == null
      ? "Unlimited product listings"
      : `Up to ${plan.max_products} products`;

  const analytics = {
    basic: "Basic analytics",
    standard: "Standard analytics",
    advanced: "Advanced analytics",
  };

  return [
    { label: limit, included: true },
    {
      label:
        analytics[String(plan.analytics_level ?? "").toLowerCase()] ??
        "Analytics included",
      included: true,
    },
    { label: "Instagram redirect", included: !!plan.instagram_redirect },
    { label: "Product badges", included: !!plan.product_badges },
    { label: "AI tools", included: !!plan.ai_tools },
    { label: "Bazaar Choice", included: !!plan.bazaar_choice },
  ];
}

export default function SubscriptionPage() {
  const { isLoggedIn, isVendor } = useAuth();

  const [plans, setPlans] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/subscriptions/plans/`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load plans from the server.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("The server returned an invalid plans response.");
        }

        const order = { free: 0, standard: 1, advanced: 2 };
        const sorted = [...data].sort(
          (a, b) =>
            (order[String(a.code).toLowerCase()] ?? 99) -
            (order[String(b.code).toLowerCase()] ?? 99)
        );

        if (!cancelled) {
          setPlans(sorted);
          setSelectedCode((current) =>
            sorted.some((plan) => plan.code === current)
              ? current
              : sorted.find(
                  (plan) => String(plan.code).toLowerCase() === "standard"
                )?.code ?? sorted[0]?.code ?? ""
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not connect to the server.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPlans();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPlan = plans.find((plan) => plan.code === selectedCode);

  async function handleContinue() {
    if (!selectedPlan || submitting) return;

    setNotice(null);
    setError("");

    // Authentication and vendor registration happen before a plan request.
    if (!isLoggedIn) {
      window.location.href = "/register/vendor";
      return;
    }

    if (!isVendor) {
      setNotice({
        type: "error",
        text: "A vendor account is required to choose a subscription plan.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${API_BASE_URL}/subscriptions/subscribe/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_code: selectedPlan.code }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "We could not process your subscription request."
        );
      }

      if (response.status === 202) {
        setNotice({
          type: "success",
          text:
            data.message ||
            "Your request has been received and is awaiting payment verification.",
        });
      } else {
        setNotice({
          type: "success",
          text: data.message || "Your subscription request was processed.",
        });
      }
    } catch (err) {
      setNotice({
        type: "error",
        text: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080f20] text-white">
      <Navbar />
      {/* Background glow matching the InstaBazaar home page */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-purple-700/15 blur-[120px]" />
        <div className="absolute -right-40 top-60 h-96 w-96 rounded-full bg-pink-600/10 blur-[120px]" />
        <div className="absolute left-1/2 top-[650px] h-72 w-96 -translate-x-1/2 rounded-full bg-amber-400/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.10),transparent_45%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pt-20 lg:px-12 lg:pt-24">
        {/* Heading */}
                <section className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-200 ">
            <Sparkles size={16} className="text-pink-400 " />
            Plans built for creators
          </div>
          </section>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-80 items-center justify-center gap-3 text-slate-300">
            <LoaderCircle size={24} className="animate-spin text-pink-400" />
            Loading subscription plans...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-red-400/30 bg-red-500/10 p-7 text-center">
            <p className="font-semibold text-red-200">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-white px-5 py-3 font-bold text-slate-900 transition hover:bg-slate-200"
            >
              Reload page
            </button>
          </div>
        )}

        {/* Interactive plans */}
        {!loading && !error && plans.length > 0 && (
          <>
            <section className="mt-16 grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 lg:mt-6">
              {plans.map((plan) => {
                const code = String(plan.code).toLowerCase();
                const style = planStyles[code] ?? planStyles.free;
                const Icon = style.icon;
                const selected = selectedCode === plan.code;
                const featured = code === "standard";
                const features = getFeatures(plan);

                return (
                  <button
                    key={plan.id ?? plan.code}
                    type="button"
                    onClick={() => {
                      setSelectedCode(plan.code);
                      setNotice(null);
                    }}
                    aria-pressed={selected}
                    className={`group relative flex h-full w-full flex-col rounded-3xl border p-6 text-left outline-none transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.015] hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#080f20] sm:p-7 lg:p-8 ${
                      selected
                        ? "border-pink-400 bg-[#14172c] shadow-[0_0_35px_rgba(217,70,239,0.14)]"
                        : "border-white/10 bg-[#0d1629]/90 hover:border-purple-400/70 hover:bg-[#131a30]"
                    } ${style.glow}`}
                  >
                    {featured && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-pink-500/20">
                        Popular choice
                      </span>
                    )}

                    {/* Selected indicator */}
                    <span
                      className={`absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200 ${
                        selected
                          ? "scale-100 border-pink-400 bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                          : "scale-90 border-white/20 text-transparent group-hover:scale-100 group-hover:border-purple-300"
                      }`}
                    >
                      <Check size={14} strokeWidth={3} />
                    </span>

                    <span
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:rotate-3 group-hover:scale-110 ${
                        code === "advanced"
                          ? "border-amber-300/20 bg-amber-400/10 text-amber-300"
                          : code === "standard"
                            ? "border-pink-400/20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-pink-300"
                            : "border-white/10 bg-white/5 text-slate-200"
                      }`}
                    >
                      <Icon size={26} />
                    </span>

                    <h2 className="mt-6 pr-5 text-2xl font-extrabold tracking-tight">
                      {plan.name}
                    </h2>

                    <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">
                      {code === "free"
                        ? "Start your online storefront and showcase your products."
                        : code === "standard"
                          ? "Reach more shoppers with more room for your products."
                          : "Unlock advanced features for your growing business."}
                    </p>

                    <div className="mt-7 flex items-baseline gap-1">
                      <span
                        className={`text-4xl font-black tracking-tight sm:text-5xl ${
                          code === "advanced"
                            ? "text-amber-300"
                            : code === "standard"
                              ? "bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent"
                              : "text-white"
                        }`}
                      >
                        ₹{formatPrice(plan.monthly_price)}
                      </span>
                      <span className="text-sm text-slate-400">/ month</span>
                    </div>

                    <div className="mt-4 border-b border-white/10 pb-6 text-sm text-slate-400">
                      {Number(plan.monthly_price) === 0
                        ? "Free to get started"
                        : "Billed monthly"}
                    </div>

                    <div className="mt-6">
                      <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Included features
                      </p>

                      <ul className="space-y-4">
                        {features.map((feature) => (
                          <li
                            key={feature.label}
                            className={`flex items-start gap-3 text-sm leading-5 transition-colors ${
                              feature.included
                                ? "text-slate-200"
                                : "text-slate-500"
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                                feature.included
                                  ? code === "advanced"
                                    ? "bg-amber-400/15 text-amber-300"
                                    : "bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-pink-300"
                                  : "bg-white/5 text-slate-600"
                              }`}
                            >
                              {feature.included ? (
                                <Check size={13} strokeWidth={3} />
                              ) : (
                                <X size={12} />
                              )}
                            </span>
                            {feature.label}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto pt-8">
                      <span
                        className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition-all duration-300 group-hover:gap-3 ${
                          selected
                            ? "bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white shadow-lg shadow-fuchsia-500/20"
                            : code === "advanced"
                              ? "border border-amber-300/40 bg-amber-400/10 text-amber-200 group-hover:bg-amber-400 group-hover:text-slate-950"
                              : "border border-white/15 bg-white/5 text-white group-hover:border-purple-400/50 group-hover:bg-purple-500/10"
                        }`}
                      >
                        {selected ? "Selected plan" : "Select this plan"}
                        <ArrowRight
                          size={16}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </button>
                );
              })}
            </section>

            {/* Selected plan action */}
            <section className="mx-auto mt-9 max-w-3xl">
              <div className="rounded-2xl border border-white/10 bg-[#10182a]/90 p-5 shadow-xl shadow-black/10 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Your selection
                  </p>
                  <p className="mt-2 text-xl font-extrabold">
                    {selectedPlan?.name ?? "Choose a plan"}
                    {selectedPlan && (
                      <span className="ml-2 text-base font-semibold text-slate-400">
                        ₹{formatPrice(selectedPlan.monthly_price)}/month
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Select a card above to change your plan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!selectedPlan || submitting}
                  className="mt-5 inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-fuchsia-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pink-500/25 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-0 sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue with {selectedPlan?.name ?? "plan"}
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>

              {notice && (
                <div
                  role="status"
                  className={`mt-4 rounded-xl border p-4 text-sm leading-6 ${
                    notice.type === "success"
                      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                      : "border-red-400/30 bg-red-500/10 text-red-200"
                  }`}
                >
                  {notice.text}
                  {notice.type === "success" && isVendor && (
                    <Link
                      href="/vendor/subscription"
                      className="ml-2 inline-flex items-center gap-1 font-bold underline underline-offset-4"
                    >
                      View subscription <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              )}
            </section>
          </>
        )}
        <section className="mx-auto max-w-3xl text-center">
          

          <h1 className="mt-7 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Grow your store.
            <span className="mt-2 block bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              Make it stand out.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            From your first product to your next big milestone, choose the
            tools your business needs to grow on InstaBazaar.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-300">
            <span className="flex items-center gap-2">
              <Check size={16} className="text-amber-400" />
              Monthly billing
            </span>
            <span className="flex items-center gap-2">
              <Check size={16} className="text-pink-400" />
              Three simple plans
            </span>
            <span className="flex items-center gap-2">
              <LockKeyhole size={15} className="text-purple-400" />
              Secure account access
            </span>
          </div>
        </section>

        {/* Bottom note */}
        <footer className="mt-16 border-t border-white/10 pt-7 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-300">
            <Rocket size={16} className="text-amber-300" />
            Built for independent creators and growing stores.
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Paid subscription requests may remain pending until payment
            verification is completed. Submitting a request does not itself
            activate a paid plan.
          </p>
        </footer>
      </div>
    </main>
  );
}
