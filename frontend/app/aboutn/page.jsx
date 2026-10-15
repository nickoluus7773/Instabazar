
"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/app/components/layout/Navbar";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  Instagram,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Sparkles,
  Store,
  Workflow,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Package,
    number: "01",
    title: "Organize your catalog",
    description:
      "Bring product details, images, pricing, and descriptions into one organized workspace.",
  },
  {
    icon: LayoutDashboard,
    number: "02",
    title: "Manage from one place",
    description:
      "Use a dedicated vendor dashboard to manage your products and access the tools available on your plan.",
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Understand your products",
    description:
      "Access product and wishlist insights according to your subscription plan.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your store",
    description:
      "Set up your vendor profile and give your business a professional home.",
  },
  {
    number: "02",
    title: "Build your catalog",
    description:
      "Add product images, descriptions, prices, and the details customers need.",
  },
  {
    number: "03",
    title: "Manage and grow",
    description:
      "Keep your catalog organized and use the available dashboard insights to guide your next steps.",
  },
];

const faqs = [
  {
    question: "What is InstaBazaar?",
    answer:
      "InstaBazaar is a platform designed to help Instagram sellers organize their products, manage their catalog, and access vendor tools from one dashboard.",
  },
  {
    question: "Who can use InstaBazaar?",
    answer:
      "Instagram sellers, creators, and small businesses that want a more organized way to present and manage their products can use InstaBazaar.",
  },
  {
    question: "Is InstaBazaar an online marketplace?",
    answer:
      "InstaBazaar focuses on vendor profiles, product catalogs, and seller management tools. It should not be confused with a full marketplace checkout or order-fulfilment service.",
  },
  {
    question: "Are all features available on every plan?",
    answer:
      "No. Product limits and analytics access depend on your subscription plan. You can review the available plans on the subscription page.",
  },
];

function SectionLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/[0.07] px-3.5 py-2 text-xs font-semibold tracking-wide text-purple-200">
      <Sparkles size={14} />
      {children}
    </div>
  );
}

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <Navbar />

      <main className="overflow-hidden bg-[#080D1B] text-white">
        {/* HERO */}
        <section className="relative isolate">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 left-[12%] h-[480px] w-[480px] rounded-full bg-purple-700/20 blur-[140px]" />
            <div className="absolute right-[-10%] top-20 h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-[130px]" />
            <div className="absolute inset-0 bg-[radial-gradient(#64748b18_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />
          </div>

          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-10 lg:pb-32 lg:pt-28">
            <div>
              <SectionLabel>ABOUT INSTABAZAAR</SectionLabel>

              <h1 className="mt-7 max-w-3xl text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-[64px]">
                Your products.
                <br />
                Your brand.
                <br />
                <span className="bg-gradient-to-r from-violet-300 via-purple-400 to-fuchsia-300 bg-clip-text text-transparent">
                  One organized space.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
                Selling on Instagram shouldn't mean managing your products
                in a mess of scattered details. InstaBazaar gives sellers a
                dedicated place to organize their catalogs, manage products,
                and access useful business insights.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register/vendor"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 transition hover:bg-purple-500"
                >
                  Become a vendor
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="/gallery"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-purple-400/50 hover:bg-white/[0.06]"
                >
                  Explore the catalog
                  <ArrowUpRight size={17} />
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <Check size={15} className="text-purple-300" />
                  Organized product listings
                </span>
                <span className="flex items-center gap-2">
                  <Check size={15} className="text-purple-300" />
                  Dedicated vendor dashboard
                </span>
              </div>
            </div>

            {/* ABSTRACT PRODUCT PREVIEW */}
            <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
              <div className="absolute -inset-5 rounded-[36px] bg-purple-600/10 blur-2xl" />

              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#101629] shadow-2xl shadow-black/40">
                <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10">
                      <Store size={20} className="text-purple-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Seller workspace</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Your catalog, organized
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300">
                    Workspace
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                        Product management
                      </p>
                      <h2 className="mt-2 text-2xl font-bold tracking-tight">
                        Your catalog
                      </h2>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
                      <Package size={20} />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/[0.07] bg-[#151D32] p-4">
                      <Package size={19} className="text-purple-300" />
                      <p className="mt-4 text-sm font-semibold">Products</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Listings in one place
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.07] bg-[#151D32] p-4">
                      <BarChart3 size={19} className="text-fuchsia-300" />
                      <p className="mt-4 text-sm font-semibold">Insights</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Available plan analytics
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.07] bg-[#151D32] p-4">
                     
                      <p className="mt-4 text-sm font-semibold">Your brand</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Seller profile
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.07] bg-[#151D32] p-4">
                      <ShieldCheck size={19} className="text-emerald-300" />
                      <p className="mt-4 text-sm font-semibold">Your account</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Profile and plan
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-purple-400/15 bg-gradient-to-r from-purple-500/10 to-fuchsia-500/[0.04] p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-200">
                        <Workflow size={19} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">
                          A clearer way to work
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          Organize products. Manage your store. Stay focused.
                        </p>
                      </div>
                      <ArrowUpRight size={18} className="shrink-0 text-purple-300" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-4 text-xs text-slate-500 sm:px-6">
                  <span>Built for social sellers</span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                    InstaBazaar
                  </span>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#151D32] p-4 shadow-xl sm:flex lg:-left-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300">
                  <Zap size={19} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Less clutter</p>
                  <p className="mt-1 text-xs text-slate-400">
                    More organized workflows
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="max-w-2xl">
              <SectionLabel>BUILT FOR SELLERS</SectionLabel>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything starts with
                <span className="text-purple-300"> better organization.</span>
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-400">
                A focused set of tools to help keep your product information
                clear and your store easier to manage.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.number}
                    className="group rounded-2xl border border-slate-800 bg-[#101629] p-6 transition duration-300 hover:-translate-y-1 hover:border-purple-500/40 hover:bg-[#121A30] sm:p-7"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/15 bg-purple-500/10 text-purple-300 transition group-hover:bg-purple-500/15">
                        <Icon size={22} />
                      </div>
                      <span className="text-xs font-semibold tracking-widest text-slate-600">
                        {feature.number}
                      </span>
                    </div>
                    <h3 className="mt-7 text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {feature.description}
                    </p>
                    <div className="mt-6 h-px w-full bg-slate-800 transition group-hover:bg-purple-500/30" />
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* MISSION */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="relative overflow-hidden rounded-[28px] border border-purple-400/15 bg-[#111629] p-7 sm:p-10 lg:p-14">
              <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-purple-600/15 blur-[100px]" />
              <div className="pointer-events-none absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[100px]" />

              <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_0.7fr] lg:gap-16">
                <div>
                  <SectionLabel>OUR PURPOSE</SectionLabel>
                  <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                    Small businesses deserve
                    <span className="block bg-gradient-to-r from-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
                      better tools, too.
                    </span>
                  </h2>
                </div>

                <div>
                  <p className="text-base leading-8 text-slate-300">
                    Our mission is to make product and catalog management
                    more organized for Instagram sellers. We want independent
                    businesses to spend less time dealing with scattered
                    product details and more time building their brands.
                  </p>
                  <div className="mt-6 flex items-center gap-3 text-sm font-medium text-purple-200">
                    <span className="h-px w-8 bg-purple-400" />
                    Designed around vendor needs
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <SectionLabel>GETTING STARTED</SectionLabel>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Three steps.
                <span className="text-purple-300"> One clearer workflow.</span>
              </h2>
              <p className="mt-4 leading-7 text-slate-400">
                Start with your store, organize your products, and manage
                everything your account makes available.
              </p>
            </div>

            <div className="relative mt-12 grid gap-5 md:grid-cols-3">
              <div className="pointer-events-none absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-purple-500/10 via-purple-400/40 to-purple-500/10 md:block" />

              {steps.map((step) => (
                <article
                  key={step.number}
                  className="relative rounded-2xl border border-slate-800 bg-[#101629] p-6 sm:p-7"
                >
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-400/20 bg-[#191A35] text-sm font-bold text-purple-200">
                    {step.number}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-slate-800/80 py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-10">
            <div>
              <SectionLabel>GOOD TO KNOW</SectionLabel>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                A few things
                <span className="text-purple-300"> worth knowing.</span>
              </h2>
              <p className="mt-4 max-w-md leading-7 text-slate-400">
                The essentials about InstaBazaar, who it serves, and how
                subscription plans work.
              </p>
              <Link
                href="/subscriptions"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-purple-300 transition hover:text-purple-200"
              >
                Explore subscription plans
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <div
                    key={faq.question}
                    className={`overflow-hidden rounded-2xl border transition ${
                      isOpen
                        ? "border-purple-500/30 bg-[#111629]"
                        : "border-slate-800 bg-[#0D1323] hover:border-slate-700"
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenFaq(isOpen ? -1 : index)
                      }
                      className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
                    >
                      <span className="text-sm font-semibold leading-6 sm:text-base">
                        {faq.question}
                      </span>
                      <ChevronDown
                        size={19}
                        className={`shrink-0 text-purple-300 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                        <p className="border-t border-slate-800 pt-4 text-sm leading-7 text-slate-400">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-5 pb-16 sm:px-8 sm:pb-24 lg:px-10">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-purple-400/20 bg-gradient-to-br from-[#211746] via-[#17142F] to-[#111629] px-6 py-12 text-center sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-purple-500/20 blur-[90px]" />

            <div className="relative mx-auto max-w-2xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-400/10 text-purple-200">
                <Sparkles size={23} />
              </div>

              <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Give your catalog
                <span className="block text-purple-300">
                  room to grow.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Bring your products together, organize your store, and
                build a more professional selling workflow with InstaBazaar.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/register/vendor"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-500"
                >
                  Start as a vendor
                  <ArrowRight size={17} />
                </Link>
                <Link
                  href="/vendors"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                >
                  Browse vendors
                  <ArrowUpRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-800/80">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
            <span>InstaBazaar</span>
            <span>Built to help sellers stay organized.</span>
          </div>
        </footer>
      </main>
    </>
  );
}
