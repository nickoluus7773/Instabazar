"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-3xl font-bold">
          <span className="text-black">Insta</span>
          <span className="text-purple-600">Bazaar</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/">Home</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/vendors">Vendors</Link>
          <Link href="/reviews">Community</Link>
        </nav>

        <div className="flex gap-3">
          {isLoggedIn ? (
            <>
              <button className="w-10 h-10 rounded-full bg-purple-600 text-white">
                👤
              </button>

              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl border text-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 rounded-xl border">
                Login
              </Link>

              <Link
                href="/register"
                className="px-4 py-2 rounded-xl bg-purple-600 text-white"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
