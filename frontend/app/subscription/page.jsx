"use client";

import { useState } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import GradientText from "../components/ui/GradientText";
import SectionContainer from "../components/ui/SectionContainer";
import SectionHeading from "../components/ui/SectionHeading";
import PricingCard from "../components/subscription/PricingCard";
import FeatureComparison from "../components/subscription/FeatureComparison";
import BenefitCards from "../components/subscription/BenefitCards";
import FaqAccordion from "../components/subscription/FaqAccordion";
import { useAuth } from "@/context/AuthContext";

const plans = [
  {
    name: "Free",
    description: "Perfect for new Instagram vendors getting started.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Start Free",
    ctaHref: "/register",
    features: [
      { text: "10 Product Listings", included: true },
      { text: "Basic Analytics", included: true },
      { text: "Follow Button", included: true },
      { text: "Instagram Redirect", included: false },
      { text: "Product Badges", included: false },
      { text: "AI Tools", included: false },
      { text: "Bazaar Choice Badge", included: false },
    ],
  },
  {
    name: "Professional",
    description: "Built for vendors ready to grow and optimize their catalog.",
    monthlyPrice: 149,
    yearlyPrice: 119,
    cta: "Get Started",
    ctaHref: "/register",
    features: [
      { text: "50 Product Listings", included: true },
      { text: "Standard Analytics", included: true },
      { text: "Follow Button", included: true },
      { text: "Instagram Redirect", included: true },
      { text: "Product Badges", included: true },
      { text: "AI Tools", included: false },
      { text: "Bazaar Choice Badge", included: false },
    ],
  },
  {
    name: "Enterprise",
    description: "For scaling brands that need premium catalog operations and tools.",
    monthlyPrice: 249,
    yearlyPrice: 199,
    cta: "Upgrade Now",
    ctaHref: "/register",
    features: [
      { text: "Unlimited Product Listings", included: true },
      { text: "Advanced Analytics", included: true },
      { text: "Follow Button", included: true },
      { text: "Instagram Redirect", included: true },
      { text: "Product Badges", included: true },
      { text: "AI Tools", included: true },
      { text: "Bazaar Choice Badge", included: true },
    ],
  },
];

const faqItems = [
  {
    question: "Can I upgrade later?",
    answer: "Yes. You can upgrade at any time and move to a higher plan when your catalog needs more visibility, analytics, or premium tools.",
  },
  {
    question: "Can I downgrade?",
    answer: "Yes. Downgrades are available, and your account will be adjusted to the next plan level based on the active billing cycle and your current catalog usage.",
  },
  {
    question: "Do I lose my products after downgrade?",
    answer: "Your catalog is preserved. A downgrade may restrict the number of products or premium features available, but your stored product data remains available.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. You can cancel anytime, and your access remains active through the end of the current billing period unless otherwise specified in the plan terms.",
  },
  {
    question: "How do subscriptions work?",
    answer: "InstaBazaar subscriptions unlock software features for catalog management, analytics, vendor visibility, and premium platform tools. They are billed on a recurring monthly or yearly basis.",
  },
  {
    question: "Is my data safe?",
    answer: "Yes. InstaBazaar follows secure platform practices for vendor accounts, catalog information, and user data. We apply reasonable technical and operational safeguards to protect stored information.",
  },
];

export default function SubscriptionPage() {
  const [billingMode, setBillingMode] = useState("monthly");
  const { isLoggedIn, isVendor } = useAuth();
  const dashboardHref = isLoggedIn && isVendor ? "/vendor/dashboard" : "/login";

  return (
    <>
      <SectionContainer
        padding="pt-24 pb-16 lg:pt-28 lg:pb-20"
        className="relative overflow-hidden bg-gradient-to-b from-white via-orange-50/40 to-white"
      >
        <div className="absolute -top-20 left-10 h-72 w-72 rounded-full bg-pink-200/30 blur-3xl" />
        <div className="absolute bottom-8 right-0 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          <Badge>💎 Pricing</Badge>

          <h1 className="mt-8 text-5xl font-black leading-[0.95] text-slate-900 sm:text-6xl lg:text-7xl">
            Choose the perfect plan to
            <span className="mt-3 block">
              <GradientText>grow your Instagram business</GradientText>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            InstaBazaar helps vendors organize products, gain visibility, and unlock premium catalog tools designed for modern Instagram businesses.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button href="/register">Start Free</Button>
            <Button variant="secondary">Compare Plans</Button>
          </div>

          <div className="mt-10 inline-flex rounded-full border border-slate-200 bg-white p-1.5 shadow-sm">
            {[
              { key: "monthly", label: "Monthly" },
              { key: "yearly", label: "Yearly" },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setBillingMode(option.key)}
                className={`rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                  billingMode === option.key
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </SectionContainer>

      <SectionContainer padding="pb-24" className="bg-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-8">
          {plans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              isPopular={plan.name === "Professional"}
              billingMode={billingMode}
            />
          ))}
        </div>
      </SectionContainer>

      <SectionContainer padding="py-24" className="bg-slate-50/80">
        <SectionHeading
          badge="📊 Compare"
          title="Simple plans for every stage of growth"
          description="Every plan is designed for a different vendor maturity level, from first-time launch to premium brand growth."
        />

        <FeatureComparison />
      </SectionContainer>

      <SectionContainer padding="py-24" className="bg-white">
        <SectionHeading
          badge="🚀 Why upgrade"
          title="Why vendors choose premium growth tools"
          description="Your catalog is more than a product list. It is a conversion engine, a brand layer, and a growth asset."
        />

        <BenefitCards />
      </SectionContainer>

      <SectionContainer padding="py-24" className="bg-slate-50/80">
        <SectionHeading
          badge="❓ FAQ"
          title="Questions vendors ask before upgrading"
          description="Everything you need to know before choosing the right plan for your catalog operations."
        />

        <FaqAccordion items={faqItems} />
      </SectionContainer>

      <SectionContainer padding="py-16" className="bg-slate-50">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Ready to grow</p>
            <h3 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              Ready to grow your catalog?
            </h3>
            <p className="mt-3 max-w-xl text-slate-600">
              Join hundreds of Instagram vendors using InstaBazaar to organize products, improve visibility, and grow with confidence.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:shrink-0">
            <Button href="/register" className="w-full sm:w-auto">Start Free</Button>
            <Button href={dashboardHref} variant="secondary" className="w-full sm:w-auto">View Dashboard</Button>
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
