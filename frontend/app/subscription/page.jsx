
"use client";

import { useCallback, useEffect, useState } from "react";
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
    glow: "group-hover:shadow-slate-500/10",
  },
  standard: {
    icon: Zap,
    glow: "group-hover:shadow-fuchsia-500/20",
  },
  advanced: {
    icon: Crown,
    glow: "group-hover:shadow-amber-500/20",
  },
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(price ?? 0));

function getFeatures(plan) {
  const analytics = {
    basic: "Basic analytics",
    standard: "Standard analytics",
    advanced: "Advanced analytics",
  };

  return [
    {
      label:
        plan.max_products == null
          ? "Unlimited product listings"
          : `Up to ${plan.max_products} products`,
      included: true,
    },
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

function loadRazorpayCheckout() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), {
        once: true,
      });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Could not load Razorpay Checkout.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () =>
      reject(new Error("Could not load Razorpay Checkout."));

    document.body.appendChild(script);
  });
}

export default function SubscriptionPage() {
  const { isLoggedIn, isVendor } = useAuth();

  const [plans, setPlans] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  const loadPageData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const plansResponse = await fetch(
        `${API_BASE_URL}/subscriptions/plans/`,
        { cache: "no-store" }
      );

      if (!plansResponse.ok) {
        throw new Error("Unable to load subscription plans.");
      }

      const plansData = await plansResponse.json();

      if (!Array.isArray(plansData)) {
        throw new Error("The server returned an invalid plans response.");
      }

      const order = { free: 0, standard: 1, advanced: 2 };
      const sortedPlans = [...plansData].sort(
        (a, b) =>
          (order[String(a.code).toLowerCase()] ?? 99) -
          (order[String(b.code).toLowerCase()] ?? 99)
      );

      let activePlan = null;
      let activeSubscription = null;

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      if (token && isVendor) {
        const currentResponse = await fetch(
          `${API_BASE_URL}/subscriptions/current/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }
        );

        if (currentResponse.ok) {
          const currentData = await currentResponse.json();
          activePlan = currentData.plan ?? null;
          activeSubscription = currentData.subscription ?? null;
        }
      }

      setPlans(sortedPlans);
      setCurrentPlan(activePlan);
      setCurrentSubscription(activeSubscription);

      setSelectedCode((previous) => {
        if (sortedPlans.some((plan) => plan.code === previous)) {
          return previous;
        }

        const matchingCurrentPlan = activePlan
          ? sortedPlans.find((plan) => plan.code === activePlan.code)
          : null;

        return (
          matchingCurrentPlan?.code ??
          sortedPlans.find(
            (plan) => String(plan.code).toLowerCase() === "standard"
          )?.code ??
          sortedPlans[0]?.code ??
          ""
        );
      });
    } catch (err) {
      setError(err.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [isVendor]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  const selectedPlan = plans.find((plan) => plan.code === selectedCode);

  const currentPlanCode = String(currentPlan?.code ?? "free").toLowerCase();
  const selectedPlanCode = String(selectedPlan?.code ?? "").toLowerCase();

  const isCurrentPlan = selectedPlanCode === currentPlanCode;
  const isFreePlan = Number(selectedPlan?.monthly_price) === 0;

  async function handleContinue() {
    if (!selectedPlan || submitting || isCurrentPlan) return;

    setNotice(null);
    setError("");

    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    if (!isVendor) {
      setNotice({
        type: "error",
        text: "A vendor account is required to choose a subscription plan.",
      });
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setSubmitting(true);

    const apiRequest = async (path, body) => {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "The request could not be completed."
        );
      }

      return { response, data };
    };

    try {
      // Free plan does not use Razorpay.
      if (isFreePlan) {
        const { data } = await apiRequest("/subscriptions/subscribe/", {
          plan_code: selectedPlan.code,
        });

        setNotice({
          type: "success",
          text: data.message || "Your free plan request was processed.",
        });

        await loadPageData();
        return;
      }

      // Create the pending subscription.
      const { data: subscriptionData } = await apiRequest(
        "/subscriptions/subscribe/",
        { plan_code: selectedPlan.code }
      );

      const subscriptionId =
        subscriptionData.subscription?.id ??
        subscriptionData.subscription?.pk ??
        subscriptionData.subscription_id ??
        subscriptionData.id;

      if (!subscriptionId) {
        throw new Error(
          "The server did not return a subscription ID. Check the subscribe endpoint."
        );
      }

      // Create or retrieve the Razorpay order.
      const { data: order } = await apiRequest(
        "/subscriptions/payment/create-order/",
        { subscription_id: subscriptionId }
      );

      if (!order.key_id || !order.order_id || !order.amount) {
        throw new Error("The server returned incomplete payment details.");
      }

      await loadRazorpayCheckout();

      const checkout = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "InstaBazaar",
        description: `${order.plan_name || selectedPlan.name} subscription`,
        order_id: order.order_id,
        theme: { color: "#c026d3" },

        handler: async (paymentResponse) => {
          setSubmitting(true);

          try {
            await apiRequest("/subscriptions/payment/verify/", {
              subscription_id: subscriptionId,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            setNotice({
              type: "success",
              text: "Payment verified! Your subscription is now active.",
            });

            // Reload the actual plan from Django after verification.
            await loadPageData();
          } catch (verificationError) {
            setNotice({
              type: "error",
              text:
                verificationError.message ||
                "Payment verification failed. Check your subscription status before retrying.",
            });
          } finally {
            setSubmitting(false);
          }
        },

        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });

      checkout.on("payment.failed", (event) => {
        setNotice({
          type: "error",
          text:
            event.error?.description ||
            "Payment failed. Check the payment status before retrying.",
        });
        setSubmitting(false);
      });

      checkout.open();
    } catch (err) {
      setNotice({
        type: "error",
        text: err.message || "Unable to start checkout. Please try again.",
      });
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080f20] text-white">
      <Navbar />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-purple-700/15 blur-[110px]" />
        <div className="absolute -right-40 top-40 h-80 w-80 rounded-full bg-pink-600/10 blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.10),transparent_45%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-8 sm:pt-10 lg:px-12">
        <section className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-200">
            <Sparkles size={16} className="text-pink-400" />
            Plans built for creators
          </div>

          <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Grow your store.
            <span className="mt-1 block bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              Make it stand out.
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Choose the tools your business needs to grow on InstaBazaar.
          </p>
        </section>

        {loading && (
          <div className="flex min-h-48 items-center justify-center gap-3 text-slate-300">
            <LoaderCircle size={23} className="animate-spin text-pink-400" />
            Loading subscription plans...
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-center">
            <p className="font-semibold text-red-200">{error}</p>
            <button
              onClick={loadPageData}
              className="mt-4 rounded-xl bg-white px-5 py-2.5 font-bold text-slate-900"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && plans.length > 0 && (
          <>
            {isVendor && currentPlan && (
              <div className="mx-auto mt-6 flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-xl border border-purple-400/20 bg-[#11182b]/90 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Your current plan
                  </p>
                  <p className="mt-1 font-bold">
                    {currentPlan.name}
                    {currentSubscription?.status && (
                      <span className="ml-2 text-xs font-medium capitalize text-emerald-300">
                        {currentSubscription.status}
                      </span>
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadPageData}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
                >
                  <LoaderCircle size={15} />
                  Refresh plan
                </button>
              </div>
            )}

            <section className="mt-8 grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
              {plans.map((plan) => {
                const code = String(plan.code).toLowerCase();
                const style = planStyles[code] ?? planStyles.free;
                const Icon = style.icon;
                const selected = selectedCode === plan.code;
                const isPlanCurrent = code === currentPlanCode;
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
                    className={`group relative flex h-full w-full flex-col rounded-2xl border p-4 text-left outline-none transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-pink-400 sm:p-5 ${
                      selected
                        ? "border-pink-400 bg-[#14172c] shadow-[0_0_25px_rgba(217,70,239,0.12)]"
                        : "border-white/10 bg-[#0d1629]/90 hover:border-purple-400/60"
                    } ${style.glow}`}
                  >
                    {featured && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider">
                        Popular choice
                      </span>
                    )}

                    {isPlanCurrent && (
                      <span className="absolute right-3 top-3 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-300">
                        Current plan
                      </span>
                    )}

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                        code === "advanced"
                          ? "border-amber-300/20 bg-amber-400/10 text-amber-300"
                          : code === "standard"
                            ? "border-pink-400/20 bg-purple-500/10 text-pink-300"
                            : "border-white/10 bg-white/5 text-slate-200"
                      }`}
                    >
                      <Icon size={21} />
                    </div>

                    <h2 className="mt-4 pr-2 text-xl font-extrabold tracking-tight">
                      {plan.name}
                    </h2>

                    <p className="mt-1 min-h-10 text-sm leading-5 text-slate-400">
                      {code === "free"
                        ? "Start your online storefront and showcase your products."
                        : code === "standard"
                          ? "Reach more shoppers with more room for your products."
                          : "Unlock advanced features for your growing business."}
                    </p>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span
                        className={`text-3xl font-black tracking-tight ${
                          code === "advanced"
                            ? "text-amber-300"
                            : code === "standard"
                              ? "bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent"
                              : "text-white"
                        }`}
                      >
                        ₹{formatPrice(plan.monthly_price)}
                      </span>
                      <span className="text-xs text-slate-400">/ month</span>
                    </div>

                    <div className="mt-2 border-b border-white/10 pb-3 text-xs text-slate-400">
                      {Number(plan.monthly_price) === 0
                        ? "Free to get started"
                        : "Billed monthly"}
                    </div>

                    <div className="mt-4">
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Included features
                      </p>

                      <ul className="space-y-2.5">
                        {features.map((feature) => (
                          <li
                            key={feature.label}
                            className={`flex items-start gap-2 text-xs leading-5 sm:text-sm ${
                              feature.included
                                ? "text-slate-200"
                                : "text-slate-500"
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                                feature.included
                                  ? code === "advanced"
                                    ? "bg-amber-400/15 text-amber-300"
                                    : "bg-purple-500/20 text-pink-300"
                                  : "bg-white/5 text-slate-600"
                              }`}
                            >
                              {feature.included ? (
                                <Check size={10} strokeWidth={3} />
                              ) : (
                                <X size={10} />
                              )}
                            </span>
                            {feature.label}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto pt-5">
                      <span
                        className={`flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition ${
                          isPlanCurrent
                            ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                            : selected
                              ? "bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white"
                              : code === "advanced"
                                ? "border border-amber-300/30 bg-amber-400/10 text-amber-200"
                                : "border border-white/15 bg-white/5 text-white"
                        }`}
                      >
                        {isPlanCurrent
                          ? "Current plan"
                          : selected
                            ? "Selected plan"
                            : "Select this plan"}
                        {isPlanCurrent ? (
                          <Check size={15} />
                        ) : (
                          <ArrowRight size={15} />
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </section>

            <section className="mx-auto mt-6 max-w-3xl">
              <div className="rounded-2xl border border-white/10 bg-[#10182a]/90 p-4 shadow-xl sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Your selection
                  </p>

                  <p className="mt-1 text-lg font-extrabold">
                    {selectedPlan?.name ?? "Choose a plan"}
                    {selectedPlan && (
                      <span className="ml-2 text-sm font-semibold text-slate-400">
                        ₹{formatPrice(selectedPlan.monthly_price)}/month
                      </span>
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {isCurrentPlan
                      ? "This plan is already active on your account."
                      : "Select a plan above. Payment starts only when you continue."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!selectedPlan || submitting || isCurrentPlan}
                  className="mt-4 inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0 sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    <>
                      Current plan
                      <Check size={16} />
                    </>
                  ) : isFreePlan ? (
                    <>
                      Choose Free
                      <ArrowRight size={16} />
                    </>
                  ) : (
                    <>
                      Continue with {selectedPlan?.name ?? "plan"}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              {notice && (
                <div
                  role="status"
                  className={`mt-3 rounded-xl border p-3 text-sm leading-6 ${
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

        <footer className="mt-10 border-t border-white/10 pt-5 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-300">
            <Rocket size={15} className="text-amber-300" />
            Built for independent creators and growing stores.
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Paid plans activate only after the backend verifies the payment.
          </p>
          <p className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-500">
            <LockKeyhole size={12} />
            Secure account access
          </p>
        </footer>
      </div>
    </main>
  );
}
