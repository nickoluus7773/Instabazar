
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getVendorProducts,
  deleteProduct,
  updateProduct,
} from "@/lib/vendorApi";
import Navbar from "@/app/components/layout/Navbar";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ImageIcon,
  LoaderCircle,
  Package,
  PackagePlus,
  RefreshCw,
  Search,
  Trash2,
  Pencil,
  Eye,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(price || 0));

const getImageUrl = (image) => {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return `${API_BASE_URL.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
};

export default function ManageProducts() {
  const { isLoggedIn } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState(null);
  const [busyProduct, setBusyProduct] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, page]);

  async function fetchProducts(showRefresh = false) {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const token = localStorage.getItem("accessToken");
      const data = await getVendorProducts(token, page, 10);

      setProducts(
        (data.results || []).map((product) => ({
          ...product,
          image: product.productImage || product.image,
          title: product.productTitle || product.title,
          price: product.productPrice ?? product.price,
          is_active: product.is_active !== false,
        }))
      );

      setTotalPages(Math.max(1, Math.ceil((data.count || 0) / 10)));
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setNotice({
        type: "error",
        message: error?.message || "Unable to load your products.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setBusyProduct(productId);
    setNotice(null);

    try {
      const token = localStorage.getItem("accessToken");
      await deleteProduct(token, productId);

      setProducts((previous) =>
        previous.filter((product) => product.id !== productId)
      );

      setNotice({
        type: "success",
        message: "Product deleted successfully.",
      });

      // Refresh the current page if deleting its last item.
      if (products.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await fetchProducts(true);
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      setNotice({
        type: "error",
        message: error?.message || "Failed to delete product.",
      });
    } finally {
      setBusyProduct(null);
    }
  };

  const handleToggleActive = async (product) => {
    setBusyProduct(product.id);
    setNotice(null);

    try {
      const token = localStorage.getItem("accessToken");

      await updateProduct(token, product.id, {
        ...product,
        is_active: !product.is_active,
      });

      setNotice({
        type: "success",
        message: `Product marked as ${
          product.is_active ? "inactive" : "active"
        }.`,
      });

      await fetchProducts(true);
    } catch (error) {
      console.error("Failed to update product:", error);
      setNotice({
        type: "error",
        message: error?.message || "Failed to update product status.",
      });
    } finally {
      setBusyProduct(null);
    }
  };

  const filteredProducts = products.filter((product) =>
    (product.title || "").toLowerCase().includes(search.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[75vh] items-center justify-center bg-[#090D1A] px-4 text-white">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11162A] p-8 text-center">
            <Package className="mx-auto text-violet-300" size={36} />
            <h1 className="mt-4 text-xl font-semibold">
              Sign in to manage products
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Log in to access your product listings.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              Go to login <ArrowUpRight size={16} />
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#090D1A] text-white">
        <div className="mx-auto max-w-[1400px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
          <Link
            href="/vendor/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-violet-300"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          {/* Heading */}
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300">
                <Package size={14} />
                Seller workspace
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Manage products
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
                Manage your marketplace listings from one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => fetchProducts(true)}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07] disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <Link
                href="/vendor/products/create"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500"
              >
                <PackagePlus size={17} />
                Add product
              </Link>
            </div>
          </div>

          {/* Notifications */}
          {notice && (
            <div
              role="status"
              className={`mb-6 flex items-start gap-3 rounded-xl border p-4 ${
                notice.type === "success"
                  ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"
                  : "border-rose-400/20 bg-rose-500/[0.07] text-rose-200"
              }`}
            >
              {notice.type === "success" ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              ) : (
                <CircleAlert size={18} className="mt-0.5 shrink-0" />
              )}

              <p className="flex-1 text-sm leading-5">{notice.message}</p>

              <button
                type="button"
                onClick={() => setNotice(null)}
                aria-label="Dismiss notification"
                className="rounded-md p-1 opacity-70 hover:bg-white/5 hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Search and listing table */}
          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11162A]">
            <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:px-6">
              <div>
                <h2 className="font-semibold text-white">Your listings</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Page {page} of {totalPages}
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search this page..."
                  aria-label="Search products on this page"
                  className="w-full rounded-xl border border-white/10 bg-[#0C1122] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                <LoaderCircle
                  size={28}
                  className="animate-spin text-violet-400"
                />
                <p className="mt-4 text-sm text-slate-400">
                  Loading your products...
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                  <Package size={26} />
                </div>
                <h3 className="mt-4 font-semibold text-white">
                  No products yet
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                  Your product catalog is empty. Add your first listing to get
                  started.
                </p>
                <Link
                  href="/vendor/products/create"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold hover:bg-violet-500"
                >
                  <PackagePlus size={16} />
                  Add your first product
                </Link>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <Search className="mx-auto text-slate-600" size={26} />
                <p className="mt-3 text-sm text-slate-400">
                  No products on this page match “{search}”.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left">
                    <thead className="border-b border-white/[0.07] bg-white/[0.02]">
                      <tr>
                        {["Product", "Price", "Views", "Status", "Actions"].map(
                          (heading) => (
                            <th
                              key={heading}
                              className="whitespace-nowrap px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500"
                            >
                              {heading}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/[0.06]">
                      {filteredProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="transition hover:bg-white/[0.025]"
                        >
                          <td className="max-w-[360px] px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/[0.07] bg-[#0C1122]">
                                {product.image ? (
                                  <img
                                    src={getImageUrl(product.image)}
                                    alt={product.title || "Product"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-slate-600">
                                    <ImageIcon size={20} />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white">
                                  {product.title || "Untitled product"}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  Product ID: {product.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-violet-300">
                            {formatPrice(product.price)}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-400">
                            <span className="inline-flex items-center gap-1.5">
                              <Eye size={15} className="text-slate-500" />
                              {product.views_count ?? 0}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(product)}
                              disabled={busyProduct === product.id}
                              aria-label={`Mark ${product.title} ${
                                product.is_active ? "inactive" : "active"
                              }`}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                                product.is_active
                                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15"
                                  : "border-slate-400/15 bg-slate-400/[0.07] text-slate-400 hover:bg-slate-400/10"
                              }`}
                            >
                              {product.is_active ? (
                                <CheckCircle2 size={13} />
                              ) : (
                                <XCircle size={13} />
                              )}
                              {product.is_active ? "Active" : "Inactive"}
                            </button>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/vendor/products/${product.id}/edit`}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-300 transition hover:text-white"
                              >
                                <Pencil size={14} />
                                Edit
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDelete(product.id)}
                                disabled={busyProduct === product.id}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-300 transition hover:text-rose-200 disabled:opacity-50"
                              >
                                {busyProduct === product.id ? (
                                  <LoaderCircle
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Responsive product cards */}
                <div className="divide-y divide-white/[0.06] md:hidden">
                  {filteredProducts.map((product) => (
                    <article key={product.id} className="p-4">
                      <div className="flex gap-3">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/[0.07] bg-[#0C1122]">
                          {product.image ? (
                            <img
                              src={getImageUrl(product.image)}
                              alt={product.title || "Product"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-600">
                              <ImageIcon size={24} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-semibold text-white">
                            {product.title || "Untitled product"}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-violet-300">
                            {formatPrice(product.price)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {product.views_count ?? 0} views
                          </p>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(product)}
                            disabled={busyProduct === product.id}
                            className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                              product.is_active
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                : "border-slate-400/15 bg-slate-400/[0.07] text-slate-400"
                            }`}
                          >
                            {product.is_active ? "Active" : "Inactive"}
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                        <Link
                          href={`/vendor/products/${product.id}/edit`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-violet-300"
                        >
                          <Pencil size={14} /> Edit product
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          disabled={busyProduct === product.id}
                          className="inline-flex items-center gap-2 text-sm font-medium text-rose-300 disabled:opacity-50"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex flex-col gap-3 border-t border-white/[0.07] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-xs text-slate-500">
                  Page {page} of {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3.5 py-2 text-sm text-slate-300 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <span className="rounded-lg bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-200">
                    {page}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                    disabled={page === totalPages}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3.5 py-2 text-sm text-slate-300 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>

          <footer className="mt-6 flex flex-col gap-2 border-t border-white/[0.07] pt-5 text-xs text-slate-600 sm:flex-row sm:justify-between">
            <span>InstaBazaar Seller Workspace</span>
            <span>Manage your marketplace listings</span>
          </footer>
        </div>
      </main>
    </>
  );
}
