
"use client";

import { useAuth } from "@/context/AuthContext";
import VendorProfile from "@/app/components/vendor/VendorProfile";
import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import {
  ArrowLeft,
  ArrowUpRight,
  Store,
  Sparkles,
} from "lucide-react";

export default function VendorProfilePage() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[75vh] items-center justify-center bg-[#090D1A] px-4 text-white">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11162A] p-8 text-center">
            <Store className="mx-auto text-violet-300" size={36} />

            <h1 className="mt-4 text-xl font-semibold">
              Sign in to continue
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Log in to manage your seller profile and storefront details.
            </p>

            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              Go to login
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#090D1A] text-white">
        <div className="mx-auto max-w-[1250px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
          <Link
            href="/vendor/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-violet-300"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>


              <VendorProfile />
           

          <footer className="mt-8 flex flex-col gap-2 border-t border-white/[0.07] pt-5 text-xs text-slate-600 sm:flex-row sm:justify-between">
            <span>InstaBazaar Seller Workspace</span>
            <span>Store profile settings</span>
          </footer>
        </div>
      </main>
    </>
  );
}
