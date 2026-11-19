"use client";

import Link from "next/link";
import { Bell, Heart, Menu, Rss, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { getBroadcastNotifications } from "@/lib/broadcastApi";

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
  const [unreadBroadcasts, setUnreadBroadcasts] = useState(0);
  const [recentBroadcasts, setRecentBroadcasts] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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

  useEffect(() => {
    if (!isLoggedIn || isVendor || !roleResolved) return;
    const token = localStorage.getItem("accessToken");
    if (token) getBroadcastNotifications(token).then((data) => {
      setUnreadBroadcasts(data.unread_count || 0);
      setRecentBroadcasts(data.results || []);
    }).catch(() => {});
  }, [isLoggedIn, isVendor, roleResolved, pathname]);

  useEffect(() => {
    const refresh = () => {
      const token = localStorage.getItem("accessToken");
      if (token) getBroadcastNotifications(token).then((data) => {
        setUnreadBroadcasts(data.unread_count || 0);
        setRecentBroadcasts(data.results || []);
      }).catch(() => {});
    };
    window.addEventListener("broadcast-read", refresh);
    return () => window.removeEventListener("broadcast-read", refresh);
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

          {isLoggedIn && roleResolved && !isVendor && (
            <div className="relative">
              <button type="button" onClick={() => setNotificationsOpen((open) => !open)} aria-expanded={notificationsOpen}
                className={`relative flex items-center gap-2 py-2 transition-colors ${isActive("/broadcasts") ? "text-[#F5AE30]" : "text-white hover:text-[#F5AE30]"}`}>
                <Bell size={16} /> Broadcasts
                {unreadBroadcasts > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F5AE30] px-1 text-xs font-bold text-[#081225]">{unreadBroadcasts}</span>}
              </button>
              {notificationsOpen && <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><span className="font-semibold">Recent broadcasts</span><span className="text-xs text-slate-500">{unreadBroadcasts} unread</span></div>
                {recentBroadcasts.length ? <div className="max-h-80 overflow-y-auto">{recentBroadcasts.map((item) => <Link key={item.broadcast_id} href="/broadcasts" onClick={() => setNotificationsOpen(false)} className="block border-b border-slate-100 px-4 py-3 hover:bg-slate-50"><span className="flex items-start gap-2"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.is_read ? "bg-slate-200" : "bg-rose-500"}`} /><span className="min-w-0"><span className="block truncate text-sm font-medium">{item.title}</span><span className="mt-0.5 block text-xs text-slate-500">{item.vendor_name}</span></span></span></Link>)}</div> : <p className="px-4 py-5 text-sm text-slate-500">No broadcast notifications yet.</p>}
                <Link href="/broadcasts" onClick={() => setNotificationsOpen(false)} className="block bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-rose-600">View all broadcasts</Link>
              </div>}
            </div>
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

            {isLoggedIn && roleResolved && !isVendor && (
              <Link href="/broadcasts" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-2 rounded-lg px-3 py-2.5 border-l-2 transition-colors ${isActive("/broadcasts") ? "border-[#F5AE30] bg-white/10 text-[#F5AE30]" : "border-transparent text-white hover:bg-white/10"}`}>
                <Bell size={16} /> Broadcasts
                {unreadBroadcasts > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F5AE30] px-1 text-xs font-bold text-[#081225]">{unreadBroadcasts}</span>}
              </Link>
            )}


          </div>
        </nav>
      )}
    </header>
  );
}

