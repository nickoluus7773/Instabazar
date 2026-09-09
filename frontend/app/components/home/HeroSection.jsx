"use client";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-[#081225] pt-15 pb-20">
      {" "}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {" "}
        <div className="grid md:grid-cols-2 gap-20 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight text-slate-900">
              Discover{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent italic">
                Unique
              </span>{" "}
              Products
              <br />
              from <span className="text-[#F5AE30] 600 italic">Real Creators</span>
            </h1>

            <p className="mt-8 text-xl text-gray-600 leading-relaxed max-w-xl">
              Connect with independent vendors, explore handcrafted goods, and
              shop directly through Instagram — all in one friendly place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-lg hover:scale-105 transition"
              >
                🔍 Explore Products
              </Link>

              <Link
                href="/vendors"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border bg-[#F5AE30] text-slate-800 font-semibold hover:bg-gray-50 transition"
              >
                👥 Meet Vendors
              </Link>
            </div>
          </div>
          {/* Right Illustration */}
          <div className="flex justify-center lg:justify-end">
          
<Image
  src="/images/heroimg1.png"
  alt="InstaBazaar marketplace"
  width={800}
  height={800}
  priority
/>
           
          </div>
        </div>
      </div>
    </section>
  );
}
