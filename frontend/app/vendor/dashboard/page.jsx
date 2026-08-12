"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getVendorProfile, getVendorStats } from "@/lib/vendorApi";
import ApprovalStatus from "@/app/components/vendor/ApprovalStatus";

export default function VendorDashboard() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [dateRange, setDateRange] = useState("18 May – 17 Jun 2025");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchDashboardData();
    }
  }, [isLoggedIn]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        logout();
        router.push("/login");
        return;
      }

      const [vendorData, statsData] = await Promise.all([
        getVendorProfile(token),
        getVendorStats(token),
      ]);
      setVendor(vendorData);
      setStats(statsData);
    } catch (error) {
      if (
        error?.message?.includes("401") ||
        error?.message?.toLowerCase().includes("unauthorized")
      ) {
        localStorage.removeItem("accessToken");
        logout();
        router.push("/login");
      } else {
        console.error("Failed to load dashboard:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm border max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Dashboard</h2>
          <p className="text-gray-600 mb-6">Please log in to access your vendor dashboard.</p>
          <Link
            href="/login"
            className="inline-block w-full py-3 px-6 rounded-2xl text-white font-bold bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg hover:shadow-xl transition-all"
          >
            Go to Login →
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-2xl font-bold mb-4">
            🏬
          </div>
          <p className="text-xl font-bold text-slate-900">No Vendor Account Found</p>
          <p className="text-sm text-slate-600 mt-2">
            Your account is signed in, but no vendor profile is associated with this user.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/register/vendor"
              className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all"
            >
              Create Vendor Profile
            </Link>
            <Link
              href="/"
              className="w-full rounded-2xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sample data fallback matching design mock
  const recentOrders = [
    { id: 1, customer: "Rahul Sharma", avatar: "https://i.pravatar.cc/150?img=11", product: "Naruto Tee", amount: "₹999", status: "Shipped", statusColor: "bg-emerald-100 text-emerald-700" },
    { id: 2, customer: "Jay Mehta", avatar: "https://i.pravatar.cc/150?img=33", product: "Vintage Nike Jacket", amount: "₹1,299", status: "Pending", statusColor: "bg-amber-100 text-amber-700" },
    { id: 3, customer: "Aryan Patel", avatar: "https://i.pravatar.cc/150?img=60", product: "F1 Red Bull Hoodie", amount: "₹1,799", status: "Delivered", statusColor: "bg-emerald-100 text-emerald-700" },
    { id: 4, customer: "Kunal Singh", avatar: "https://i.pravatar.cc/150?img=68", product: "Denim Shirt", amount: "₹899", status: "Pending", statusColor: "bg-amber-100 text-amber-700" },
  ];

  const topSellingProducts = [
    { id: 1, name: "Vintage Nike Jacket", orders: "54 Orders", image: "🧥" },
    { id: 2, name: "Naruto Graphic Tee", orders: "42 Orders", image: "👕" },
    { id: 3, name: "F1 Red Bull Hoodie", orders: "31 Orders", image: "🧥" },
  ];

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "🟣", path: "/vendor/dashboard" },
    { id: "products", label: "My Products", icon: "🛍️", path: "/vendor/products" },
    { id: "add_product", label: "Add Product", icon: "➕", path: "/vendor/products/create" },
    { id: "orders", label: "Orders", icon: "📦", path: "#" },
    { id: "analytics", label: "Analytics", icon: "📊", path: "#" },
    { id: "wishlist", label: "Wishlist Analytics", icon: "🤍", path: "#" },
    { id: "profile", label: "Profile", icon: "👤", path: "/vendor/profile" },
    { id: "subscription", label: "Subscription", icon: "💳", path: "/vendor/subscription" },
    { id: "settings", label: "Settings", icon: "⚙️", path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-6 sticky top-0 h-screen overflow-y-auto">
        {/* Brand Logo & Subtitle */}
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-2xl font-black">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center text-white text-sm shadow-md">
              IB
            </div>
            <span>
              <span className="text-slate-900">Insta</span>
              <span className="text-purple-600">Bazaar</span>
            </span>
          </Link>
          <div className="mt-4">
            <h2 className="text-lg font-bold text-slate-900">Vendor Dashboard</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Centralized hub for Instagram thrift store sellers
            </p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1.5">
          <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-3">
            Sidebar (All Pages)
          </div>
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={() => setActiveNav(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="pt-6 border-t border-slate-100">
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-all"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-slate-600 rounded-xl hover:bg-slate-100"
            >
              ☰
            </button>
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-2xl bg-slate-100 border border-transparent focus:border-purple-500 focus:bg-white text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative w-10 h-10 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all">
              🔔
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>

            {/* Vendor Profile Pill */}
            <Link
              href="/vendor/profile"
              className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center overflow-hidden text-sm">
                {vendor.logo_url ? (
                  <img src={vendor.logo_url} alt={vendor.business_name} className="w-full h-full object-cover" />
                ) : (
                  vendor.business_name?.substring(0, 2).toUpperCase() || "VS"
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-slate-900 leading-tight">{vendor.business_name || "Dev Shop"}</p>
                <p className="text-xs text-slate-500">@{vendor.instagram_handle || vendor.store_slug || "dev.thrift"}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="p-6 lg:p-8 space-y-8 flex-1">
          {/* Approval Warning Banner if Pending */}
          <ApprovalStatus isApproved={vendor.verification_status === "verified"} />

          {/* Greeting Header & Date Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                Hello, {vendor.business_name || "Dev"} <span className="animate-bounce">👋</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Here's what's happening with your store today.
              </p>
            </div>

            {/* Date Picker Selector */}
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition-all">
              <span>📅</span>
              <span>{dateRange}</span>
              <span className="text-slate-400 ml-1">▼</span>
            </div>
          </div>

          {/* KPI Metrics Cards (4 Columns Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Metric 1: Total Products */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
                  📦
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  ↑ 12%
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">
                  {stats?.total_products !== undefined ? stats.total_products : 24}
                </p>
                <p className="text-xs text-slate-400 mt-1">from last month</p>
              </div>
            </div>

            {/* Metric 2: Total Orders */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl">
                  🛍️
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  ↑ 8%
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">17</p>
                <p className="text-xs text-slate-400 mt-1">from last month</p>
              </div>
            </div>

            {/* Metric 3: Revenue */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                  ₹
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  ↑ 15%
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">₹18,450</p>
                <p className="text-xs text-slate-400 mt-1">from last month</p>
              </div>
            </div>

            {/* Metric 4: Store Views */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                  👁️
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  ↑ 10%
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Store Views</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">
                  {stats?.total_views !== undefined && stats.total_views > 0 ? stats.total_views : "2,304"}
                </p>
                <p className="text-xs text-slate-400 mt-1">from last month</p>
              </div>
            </div>
          </div>

          {/* Grid Layout: Middle Section + Right Column Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Recent Orders & Top Selling Products */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Orders Table Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
                  <button className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl hover:bg-purple-100 transition-all">
                    View all
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Product</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/60 transition-all">
                          <td className="py-3.5 pr-4 flex items-center gap-3">
                            <img src={order.avatar} alt={order.customer} className="w-8 h-8 rounded-full object-cover" />
                            <span className="font-semibold text-slate-800">{order.customer}</span>
                          </td>
                          <td className="py-3.5 px-2 text-slate-600">{order.product}</td>
                          <td className="py-3.5 px-2 font-bold text-slate-900">{order.amount}</td>
                          <td className="py-3.5 pl-4 text-right">
                            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${order.statusColor}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Selling Products Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Top Selling Products</h3>
                  <button className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl hover:bg-purple-100 transition-all">
                    View all
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    {topSellingProducts.map((prod) => (
                      <div key={prod.id} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 hover:bg-purple-50/50 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-xs">
                          {prod.image}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{prod.name}</p>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">{prod.orders}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Trophy Illustration Graphic */}
                  <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-purple-50 to-pink-50 rounded-3xl border border-purple-100 text-center">
                    <div className="text-5xl mb-2 animate-bounce">🏆</div>
                    <p className="text-sm font-extrabold text-purple-900">Top Performing Store!</p>
                    <p className="text-xs text-purple-600 mt-1">Your store sales are in the top 5% this month.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Vendor Card, Bazaar Score, Low Stock & Store Overview */}
            <div className="space-y-6">
              {/* Vendor Profile Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
                <div className="w-20 h-20 rounded-full bg-slate-900 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-lg mb-3 overflow-hidden">
                  {vendor.logo_url ? (
                    <img src={vendor.logo_url} alt={vendor.business_name} className="w-full h-full object-cover" />
                  ) : (
                    vendor.business_name?.substring(0, 2).toUpperCase() || "DEV"
                  )}
                </div>
                <h4 className="text-xl font-bold text-slate-900">{vendor.business_name || "Dev Shop"}</h4>
                <p className="text-xs font-medium text-slate-500 mt-0.5">@{vendor.instagram_handle || vendor.store_slug || "dev.thrift"}</p>
              </div>

              {/* Bazaar Score Widget */}
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-3xl p-6 border border-purple-100 shadow-sm text-center">
                <p className="text-xs font-extrabold text-purple-700 uppercase tracking-wider">Bazaar Score</p>
                <div className="my-3 flex items-center justify-center gap-2">
                  <span className="text-3xl text-amber-500">⭐</span>
                  <span className="text-4xl font-black text-slate-900">89</span>
                  <span className="text-slate-400 font-bold text-lg">/100</span>
                </div>
                <p className="text-xs font-semibold text-purple-800">Great job! Keep growing 🔥</p>
              </div>

              {/* Low Stock Alert Widget */}
              <div className="bg-rose-50/70 rounded-3xl p-5 border border-rose-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚠️</span> Low Stock Alert
                  </span>
                </div>
                <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-rose-100">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                    🧥
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Vintage Hoodie</p>
                    <p className="text-xs font-bold text-rose-600 mt-0.5">Only 2 left in stock!</p>
                  </div>
                </div>
              </div>

              {/* Store Overview Widget */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs text-slate-400">Store Overview</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs">💜</span> Followers
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">{vendor.follower_count || 1245}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center text-xs">💖</span> Products Saved
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">{stats?.total_favorites || 128}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">⭐</span> Positive Reviews
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">97%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Footer Grid */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/vendor/products/create"
                className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
                  ➕
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Add Product</p>
                  <p className="text-xs text-slate-500">List a new product</p>
                </div>
              </Link>

              <Link
                href="/vendor/products"
                className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                  📂
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Manage Products</p>
                  <p className="text-xs text-slate-500">View and edit products</p>
                </div>
              </Link>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                  📦
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Orders</p>
                  <p className="text-xs text-slate-500">View all orders</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                  📈
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Analytics</p>
                  <p className="text-xs text-slate-500">Check your stats</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

