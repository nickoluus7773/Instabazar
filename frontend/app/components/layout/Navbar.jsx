"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const { isLoggedIn, isVendor, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          {isLoggedIn && isVendor && <Link href="/subscription">Subscription</Link>}
        </nav>

        <div className="flex gap-3 items-center">
          {isLoggedIn ? (
            <>
              {isVendor ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="w-10 h-10 rounded-full border-2 border-purple-500 bg-white text-xl flex items-center justify-center hover:bg-purple-50 transition duration-200 focus:outline-none"
                    aria-label="Profile Menu"
                  >
                    👤
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      {/* UNCOMMENT IN FUTURE TO RESTORE PROFILE OPTION:
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition duration-150"
                      >
                        <span className="text-base">👤</span> Profile
                      </Link>
                      */}
                      <Link
                        href="/vendor/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition duration-150"
                      >
                        <span className="text-base">📊</span> Dashboard
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/profile">
                  <button className="w-10 h-10 rounded-full border-2 border-purple-500 bg-white text-xl flex items-center justify-center hover:bg-purple-50 transition duration-200">
                    👤
                  </button>
                </Link>
              )}

              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl border text-red-500 hover:bg-red-50 transition duration-200"
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
