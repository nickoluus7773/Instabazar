"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import Navbar from "@/app/components/layout/Navbar";

export default function VendorSubscriptionRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/subscription");
  }, [router]);

  return (
    <>
      <Navbar />
      <main className="flex min-h-[75vh] flex-col items-center justify-center bg-[#090D1A] px-4 text-center text-white">
        <LoaderCircle className="animate-spin text-violet-400" size={36} />
        <h1 className="mt-4 text-xl font-bold">Redirecting to Subscriptions...</h1>
        <p className="mt-2 text-sm text-slate-400">
          Taking you to the official subscription plans and checkout page.
        </p>
        <Link
          href="/subscription"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
        >
          Continue to Subscriptions
        </Link>
      </main>
    </>
  );
}
