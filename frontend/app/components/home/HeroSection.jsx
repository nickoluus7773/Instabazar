"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-white pt-15 pb-20">
      {" "}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {" "}
        <div className="grid md:grid-cols-2 gap-20 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-slate-900">
              Discover{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent italic">
                Unique
              </span>{" "}
              Products
              <br />
              from <span className="text-orange-600 italic">Real Creators</span>
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
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-gray-300 bg-white text-slate-800 font-semibold hover:bg-gray-50 transition"
              >
                👥 Meet Vendors
              </Link>
            </div>
          </div>
          {/* Right Illustration */}
          <div className="flex justify-center lg:justify-end">
            <svg
              viewBox="0 0 420 380"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full max-w-[420px]"
            >
              <circle cx="210" cy="190" r="170" fill="#eaf5f5" opacity="0.7" />

              <rect
                x="40"
                y="170"
                width="100"
                height="90"
                rx="8"
                fill="white"
                stroke="#e8e4de"
                strokeWidth="1.5"
              />
              <rect
                x="35"
                y="158"
                width="110"
                height="20"
                rx="4"
                fill="#2d7d7d"
              />

              <rect
                x="280"
                y="150"
                width="100"
                height="110"
                rx="8"
                fill="white"
                stroke="#e8e4de"
                strokeWidth="1.5"
              />
              <rect
                x="275"
                y="138"
                width="110"
                height="20"
                rx="4"
                fill="#c47fa0"
              />

              <rect
                x="155"
                y="130"
                width="110"
                height="130"
                rx="10"
                fill="white"
                stroke="#e8e4de"
                strokeWidth="2"
              />

              <rect
                x="148"
                y="116"
                width="124"
                height="24"
                rx="6"
                fill="#c47fa0"
              />

              <text
                x="210"
                y="133"
                textAnchor="middle"
                fontSize="11"
                fill="white"
                fontWeight="700"
              >
                InstaBazaar
              </text>

              <circle cx="185" cy="170" r="18" fill="#eaf5f5" />
              <circle cx="235" cy="170" r="18" fill="#faf0f5" />
              <circle cx="185" cy="215" r="18" fill="#e8f7f1" />
              <circle cx="235" cy="215" r="18" fill="#eaf5f5" />

              <circle cx="95" cy="280" r="20" fill="#faf0f5" stroke="#e8e4de" />

              <rect
                x="75"
                y="300"
                width="40"
                height="45"
                rx="8"
                fill="#faf0f5"
                stroke="#e8e4de"
              />

              <circle
                cx="325"
                cy="280"
                r="20"
                fill="#eaf5f5"
                stroke="#e8e4de"
              />

              <rect
                x="305"
                y="300"
                width="40"
                height="45"
                rx="8"
                fill="#eaf5f5"
                stroke="#e8e4de"
              />

              <rect
                x="338"
                y="248"
                width="32"
                height="32"
                rx="8"
                fill="url(#instaGrad)"
              />

              <defs>
                <linearGradient
                  id="instaGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#833ab4" />
                  <stop offset="50%" stopColor="#fd1d1d" />
                  <stop offset="100%" stopColor="#fcb045" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
