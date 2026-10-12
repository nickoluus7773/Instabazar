"use client";

import Link from "next/link";
import { Heart, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useEffect, useState, useRef } from "react";

export default function Navbar() {
  const { isLoggedIn, isVendor, logout } = useAuth();
  const { favorites } = useFavorites();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <header className="bg-[#081225] border-b border-white/10 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-3xl font-bold">
          <span className="text-white">Insta</span>
          <span className="text-[#F5AE30]">Bazaar</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-white">
          <Link href="/">Home</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/vendors">Vendors</Link>
          {isLoggedIn && !isVendor && (
            <Link href="/wishlist" className="flex items-center gap-2">
              <Heart size={17} />
              Wishlist
              {favorites.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F5AE30] px-1 text-xs font-bold text-[#081225]">
                  {favorites.length}
                </span>
              )}
            </Link>
          )}
          {isLoggedIn && isVendor && <Link href="/reviews">Community</Link>}
          {isLoggedIn && isVendor && <Link href="/subscription">Subscription</Link>}
        </nav>

        <div className="flex gap-3 items-center">
          {isLoggedIn ? (
            <>
              {isVendor ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="w-10 h-10 rounded-full border-2 border-[#F5AE30] bg-white text-xl flex items-center justify-center hover:bg-[#F5AE30]/10 transition duration-200 focus:outline-none"
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
              <Link href="/login" className="px-4 py-2  rounded-xl border border-[#F5AE30] text-[#F5AE30]">
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

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden w-10 h-10 rounded-xl border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition duration-200"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-white/10 px-6 py-4 text-white">
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 hover:bg-white/10"
            >
              Home
            </Link>
            <Link
              href="/gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 hover:bg-white/10"
            >
              Gallery
            </Link>
            <Link
              href="/vendors"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 hover:bg-white/10"
            >
              Vendors
            </Link>
            {isLoggedIn && !isVendor && (
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-white/10"
              >
                <Heart size={17} />
                Wishlist
                {favorites.length > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F5AE30] px-1 text-xs font-bold text-[#081225]">
                    {favorites.length}
                  </span>
                )}
              </Link>
            )}
            {isLoggedIn && isVendor && (
              <Link
                href="/reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 hover:bg-white/10"
              >
                Community
              </Link>
            )}
            {isLoggedIn && isVendor && (
              <Link
                href="/subscription"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 hover:bg-white/10"
              >
                Subscription
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
  
