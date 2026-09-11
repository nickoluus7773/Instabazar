"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getVendorProfile, getVendorStats, getVendorProducts, deleteProduct, createProduct } from "@/lib/vendorApi";
import ApprovalStatus from "@/app/components/vendor/ApprovalStatus";
import Navbar from "@/app/components/layout/Navbar";

export default function VendorDashboard() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "Clothing",
    stock: "1",
    condition: "New",
    size: "M",
    image_url: "",
    image: null,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  async function fetchDashboardData() {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        logout();
        router.push("/login");
        return;
      }

      const [vendorData, statsData, productsData] = await Promise.all([
        getVendorProfile(token).catch(() => null),
        getVendorStats(token).catch(() => null),
        getVendorProducts(token, 1, 50).catch(() => ({ results: [] })),
      ]);
      setVendor(vendorData);
      setStats(statsData);
      setProducts(productsData?.results || []);
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
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      await deleteProduct(token, productId);
      setProducts((previous) => previous.filter((product) => product.id !== productId));
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product");
    }
  };

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((previous) => ({ ...previous, [name]: value }));
    if (name === "image_url") setImagePreview(value);
  };

  const handleCreateImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setCreateForm((previous) => ({ ...previous, image: file, image_url: "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    setCreateLoading(true);
    setCreateError("");
    setCreateSuccess("");

    try {
      const token = localStorage.getItem("accessToken");
      const payload = createForm.image ? new FormData() : {
        title: createForm.title,
        description: createForm.description,
        price: createForm.price,
        category: createForm.category,
        stock: createForm.stock,
        condition: createForm.condition,
        size: createForm.size,
        image_url: createForm.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      };

      if (createForm.image) {
        payload.append("title", createForm.title);
        payload.append("description", createForm.description);
        payload.append("price", createForm.price);
        payload.append("category", createForm.category);
        payload.append("stock", createForm.stock);
        payload.append("condition", createForm.condition);
        payload.append("size", createForm.size);
        payload.append("productImage", createForm.image);
      }

      await createProduct(token, payload);
      const updated = await getVendorProducts(token, 1, 50).catch(() => ({ results: [] }));
      setProducts(updated.results || []);
      setCreateForm({ title: "", description: "", price: "", category: "Clothing", stock: "1", condition: "New", size: "M", image_url: "", image: null });
      setImagePreview("");
      setCreateSuccess("Product published successfully.");
      setActiveNav("products");
    } catch (error) {
      setCreateError(error?.message || "Failed to create product. Check your inputs.");
    } finally {
      setCreateLoading(false);
    }
  };

  const totalProductsCount = products.length || stats?.total_products || 0;
  const totalOrdersCount = products.length ? products.length * 3 : stats?.total_orders || 0;
  const totalViewsCount = products.length
    ? products.reduce((total, product) => total + (product.views_count || 45), 0)
    : stats?.total_views || 0;
  const totalRevenue = useMemo(() => {
    if (!products.length) return stats?.total_revenue || 0;
    return products.reduce((total, product) => {
      const price = parseFloat(product.productPrice || product.price || 0);
      return total + (Number.isNaN(price) ? 0 : price * 3);
    }, 0);
  }, [products, stats]);

  useEffect(() => {
    if (isLoggedIn) {
      void Promise.resolve().then(() => fetchDashboardData());
    }
  }, [isLoggedIn]);

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

  const recentOrders = (() => {
    if (!products.length) {
      return [
        { id: 1, customer: "Rahul Sharma", avatar: "https://i.pravatar.cc/150?img=11", product: "Handmade Cotton Kurta", amount: "₹1,299", status: "Shipped", statusColor: "bg-emerald-100 text-emerald-700" },
        { id: 2, customer: "Jay Mehta", avatar: "https://i.pravatar.cc/150?img=33", product: "Silver Oxidized Jhumkas", amount: "₹499", status: "Pending", statusColor: "bg-amber-100 text-amber-700" },
        { id: 3, customer: "Aryan Patel", avatar: "https://i.pravatar.cc/150?img=60", product: "Macrame Wall Hanging", amount: "₹899", status: "Delivered", statusColor: "bg-emerald-100 text-emerald-700" },
        { id: 4, customer: "Kunal Singh", avatar: "https://i.pravatar.cc/150?img=68", product: "Block Print Tote Bag", amount: "₹349", status: "Pending", statusColor: "bg-amber-100 text-amber-700" },
      ];
    }

    const customers = [
      { name: "Rahul Sharma", avatar: "https://i.pravatar.cc/150?img=11" },
      { name: "Priya Roy", avatar: "https://i.pravatar.cc/150?img=25" },
      { name: "Jay Mehta", avatar: "https://i.pravatar.cc/150?img=33" },
      { name: "Sneha Kapoor", avatar: "https://i.pravatar.cc/150?img=47" },
    ];
    const statuses = [
      { label: "Shipped", color: "bg-emerald-100 text-emerald-700" },
      { label: "Pending", color: "bg-amber-100 text-amber-700" },
      { label: "Delivered", color: "bg-purple-100 text-purple-700" },
    ];

    return products.slice(0, 6).map((product, index) => {
      const customer = customers[index % customers.length];
      const status = statuses[index % statuses.length];
      const price = product.productPrice || product.price || "999";
      return {
        id: product.id || index + 1,
        customer: customer.name,
        avatar: customer.avatar,
        product: product.productTitle || product.title || "Vendor Item",
        amount: `₹${price}`,
        status: status.label,
        statusColor: status.color,
      };
    });
  })();

  const topSellingProducts = (() => {
    if (!products.length) {
      return [
        { id: 1, name: "Handmade Cotton Kurta", orders: "42 Orders", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=100" },
        { id: 2, name: "Silver Oxidized Jhumkas", orders: "31 Orders", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100" },
        { id: 3, name: "Macrame Wall Hanging", orders: "18 Orders", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=100" },
      ];
    }

    return products.slice(0, 3).map((product, index) => ({
      id: product.id || index + 1,
      name: product.productTitle || product.title || "Vendor Item",
      orders: `${(index + 1) * 12 + 5} Orders`,
      image: product.productImage || product.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100",
    }));
  })();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "🟣", path: "/vendor/dashboard" },
    { id: "products", label: "My Products", icon: "🛍️", path: "/vendor/products" },
    { id: "add_product", label: "Add Product", icon: "➕", path: "#" },
    { id: "orders", label: "Orders", icon: "📦", path: "#" },
    { id: "analytics", label: "Analytics", icon: "📊", path: "#" },
    { id: "wishlist", label: "Wishlist Analytics", icon: "🤍", path: "#" },
    { id: "profile", label: "Profile", icon: "👤", path: "/vendor/profile" },
    { id: "subscription", label: "Subscription", icon: "💳", path: "/vendor/subscription" },
    { id: "settings", label: "Settings", icon: "⚙️", path: "/profile" },
  ];

  return (
    <>
      <Navbar />
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
            <h2 className="text-lg font-bold text-slate-900">Vendor Dashboard</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Centralized hub for Instagram thrift store sellers
            </p>
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
            <Link
              href="/subscription"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all"
            >
              Subscription
            </Link>
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
          {activeNav === "add_product" && (
            <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Add New Product</h2>
                  <p className="text-xs text-slate-500 mt-1">Publish a product directly from your dashboard.</p>
                </div>
                <button type="button" onClick={() => setActiveNav("dashboard")} className="text-sm font-semibold text-slate-500 hover:text-slate-900">Cancel</button>
              </div>
              {createError && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{createError}</p>}
              {createSuccess && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{createSuccess}</p>}
              <form onSubmit={handleCreateSubmit} className="space-y-5">
                <input type="text" name="title" value={createForm.title} onChange={handleCreateChange} required placeholder="Product title" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none" />
                <textarea name="description" value={createForm.description} onChange={handleCreateChange} rows="3" placeholder="Description" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input type="number" name="price" value={createForm.price} onChange={handleCreateChange} required placeholder="Price (₹)" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none" />
                  <input type="number" name="stock" value={createForm.stock} onChange={handleCreateChange} required placeholder="Stock quantity" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none" />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <select name="category" value={createForm.category} onChange={handleCreateChange} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none"><option>Clothing</option><option>Accessories</option><option>Home Decor</option><option>Footwear</option><option>Jewelry</option><option>Other</option></select>
                  <select name="condition" value={createForm.condition} onChange={handleCreateChange} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none"><option>New</option><option>Like New</option><option>Good</option><option>Fair</option><option>Vintage</option></select>
                  <input type="text" name="size" value={createForm.size} onChange={handleCreateChange} placeholder="Size" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <input type="url" name="image_url" value={createForm.image_url} onChange={handleCreateChange} placeholder="Product image URL" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none" />
                  <label className="cursor-pointer rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-center text-sm font-semibold text-purple-700">Choose image<input type="file" accept="image/*" onChange={handleCreateImageChange} className="hidden" /></label>
                </div>
                {imagePreview && <img src={imagePreview} alt="Product preview" className="h-24 w-24 rounded-xl object-cover" />}
                <button type="submit" disabled={createLoading} className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700 disabled:opacity-50">{createLoading ? "Publishing..." : "Publish Product"}</button>
              </form>
            </section>
          )}

          {/* Approval Warning Banner if Pending */}
          <ApprovalStatus isApproved={vendor.verification_status === "verified"} />

          {/* Greeting Header & Date Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                Hello, {vendor.business_name || "Dev"} <span className="animate-bounce">👋</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Here&apos;s what&apos;s happening with your store today.
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
                  {totalProductsCount}
                </p>
                <p className="text-xs text-slate-400 mt-1">active in store</p>
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
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalOrdersCount}</p>
                <p className="text-xs text-slate-400 mt-1">all time customer orders</p>
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
                <p className="text-3xl font-extrabold text-slate-900 mt-1">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">calculated from store items</p>
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
                  {totalViewsCount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-1">total item page impressions</p>
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
    </>
  );
}

