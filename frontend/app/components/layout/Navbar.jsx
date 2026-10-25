"use client";

import Link from "next/link";
import { Heart, Menu, Rss, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { isLoggedIn, isVendor, roleResolved, logout } = useAuth();
  const { favorites } = useFavorites();
  const pathname = usePathname();

  const isActive = (href) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
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
          {[
            { href: "/", label: "Home" },
            { href: "/gallery", label: "Gallery" },
            { href: "/vendors", label: "Vendors" },
            { href: "/subscription", label: isVendor ? "Subscription" : "Plans" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`relative py-2 transition-colors ${isActive(item.href)
                ? "text-[#F5AE30] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#F5AE30]"
                : "text-white hover:text-[#F5AE30]"
                }`}
            >
              {item.label}
            </Link>
          ))}

          {isLoggedIn && !isVendor && (
            <Link
              href="/wishlist"
              aria-current={isActive("/wishlist") ? "page" : undefined}
              className={`relative flex items-center gap-2 py-2 transition-colors ${isActive("/wishlist")
                ? "text-[#F5AE30] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#F5AE30]"
                : "text-white hover:text-[#F5AE30]"
                }`}
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

          {isLoggedIn && roleResolved && !isVendor && (
            <Link href="/feed" aria-current={isActive("/feed") ? "page" : undefined}
              className={`relative flex items-center gap-2 py-2 transition-colors ${isActive("/feed") ? "text-[#F5AE30]" : "text-white hover:text-[#F5AE30]"}`}>
              <Rss size={16} /> Following Feed
            </Link>
          )}

        </nav>


        <div className="flex gap-3 items-center">
          {isLoggedIn ? (
            <>
              {isVendor ? (

                <Link href="/vendor/dashboard">
                  <button className="w-10 h-10 rounded-full border-2 border-purple-500 bg-white text-xl flex items-center justify-center hover:bg-purple-50 transition duration-200">
                    👤
                  </button>
                </Link>
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
              className={`rounded-lg px-3 py-2.5 border-l-2 transition-colors ${isActive("/")
                ? "border-[#F5AE30] bg-white/10 text-[#F5AE30]"
                : "border-transparent text-white hover:bg-white/10"
                }`}
            >
              Home
            </Link>
            <Link
              href="/gallery"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2.5 border-l-2 transition-colors ${isActive("/gallery")
                ? "border-[#F5AE30] bg-white/10 text-[#F5AE30]"
                : "border-transparent text-white hover:bg-white/10"
                }`}
            >
              Gallery
            </Link>
            <Link
              href="/vendors"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2.5 border-l-2 transition-colors ${isActive("/vendors")
                ? "border-[#F5AE30] bg-white/10 text-[#F5AE30]"
                : "border-transparent text-white hover:bg-white/10"
                }`}
            >
              Vendors
            </Link>

            <Link
              href="/subscription"
              onClick={() => setMobileMenuOpen(false)}
              aria-current={isActive("/subscription") ? "page" : undefined}
              className={`rounded-lg px-3 py-2.5 border-l-2 transition-colors ${isActive("/subscription")
                ? "border-[#F5AE30] bg-white/10 text-[#F5AE30]"
                : "border-transparent text-white hover:bg-white/10"
                }`}
            >
              {isVendor ? "Subscription" : "Plans"}
            </Link>

            {isLoggedIn && !isVendor && (
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive("/wishlist") ? "page" : undefined}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 border-l-2 transition-colors ${isActive("/wishlist")
                    ? "border-[#F5AE30] bg-white/10 text-[#F5AE30]"
                    : "border-transparent text-white hover:bg-white/10"
                  }`}
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

            {isLoggedIn && roleResolved && !isVendor && (
              <Link href="/feed" onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 border-l-2 transition-colors ${isActive("/feed") ? "border-[#F5AE30] bg-white/10 text-[#F5AE30]" : "border-transparent text-white hover:bg-white/10"}`}>
                <Rss size={16} /> Following Feed
              </Link>
            )}


          </div>
        </nav>
      )}
    </header>
  );
}

