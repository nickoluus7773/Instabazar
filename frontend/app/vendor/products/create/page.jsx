
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  PackagePlus,
  Sparkles,
  Upload,
  X,
  IndianRupee,
  Tag,
  AlignLeft,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { createProduct } from "@/lib/vendorApi";
import Navbar from "@/app/components/layout/Navbar";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0C1122] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/15";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-300";

function isInstagramPostUrl(value) {
  try {
    const url = new URL(value.trim());
    const pathParts = url.pathname.split("/").filter(Boolean);
    return url.protocol === "https:" &&
      ["instagram.com", "www.instagram.com"].includes(url.hostname.toLowerCase()) &&
      ["p", "reel", "tv"].includes(pathParts[0]) &&
      Boolean(pathParts[1]);
  } catch {
    return false;
  }
}

export default function CreateProduct() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Clothing",
    condition: "New",
    size: "M",
    image_url: "",
    image: null,
    instagram_post_url: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const isLimitError =
    error.code === "PRODUCT_LIMIT_REACHED" ||
    error.upgrade_required === true;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "image_url") {
      setImagePreview(value);
      setFormData((previous) => ({
        ...previous,
        image_url: value,
        image: null,
      }));
    }

    if (error) setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Please choose an image smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setFormData((previous) => ({
      ...previous,
      image: file,
      image_url: "",
    }));

    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    setFormData((previous) => ({
      ...previous,
      image: null,
      image_url: "",
    }));
    setImagePreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/login");
      return;
    }

    if (Number(formData.price) <= 0) {
      setError("Enter a price greater than ₹0.");
      return;
    }

    if (!isInstagramPostUrl(formData.instagram_post_url)) {
      setError("Enter a valid direct Instagram post, reel, or video URL for this product.");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();

      payload.append("title", formData.title.trim());
      payload.append("description", formData.description.trim());
      payload.append("price", formData.price);
      payload.append("category", formData.category);
      payload.append("instagram_post_url", formData.instagram_post_url.trim());

      // Retained for backend compatibility. Stock is not managed in this UI.
      payload.append("stock", "1");

      payload.append("condition", formData.condition);
      payload.append("size", formData.size.trim() || "Standard");

      if (formData.image) {
        payload.append("productImage", formData.image);
      } else if (formData.image_url.trim()) {
        payload.append("image_url", formData.image_url.trim());
      }

      await createProduct(token, payload);

      router.push("/gallery");
    } catch (err) {
      setError({
        message:
          err?.message ||
          "We couldn't publish your product. Please try again.",
        code: err?.code,
        product_limit: err?.product_limit,
        upgrade_required: err?.upgrade_required,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[75vh] items-center justify-center bg-[#090D1A] px-4 text-white">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11162A] p-8 text-center">
            <PackagePlus className="mx-auto text-violet-300" size={36} />
            <h1 className="mt-4 text-xl font-semibold">Sign in to continue</h1>
            <p className="mt-2 text-sm text-slate-400">
              Log in to your seller account to publish a product.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold hover:bg-violet-500"
            >
              Go to login <ArrowUpRight size={16} className="ml-2" />
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
        <div className="mx-auto max-w-[1250px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
          {/* Breadcrumb */}
          <Link
            href="/vendor/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-violet-300"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          {/* Page heading */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300">
                <Sparkles size={14} />
                Seller workspace
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Add a new product
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Give your product a great presentation and add it to the
                InstaBazaar marketplace.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={16} className="text-emerald-400" />
              Your listing is subject to your subscription limit
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              {/* Main form */}
              <div className="space-y-6">
                

                <section className="rounded-2xl border border-white/[0.08] bg-[#11162A] p-5 sm:p-7">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                      <PackagePlus size={20} />
                    </div>
                    <div>
                      <h2 className="font-semibold">Product details</h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Basic information shoppers will see
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label htmlFor="title" className={labelClass}>
                        Product title <span className="text-violet-300">*</span>
                      </label>
                      <input
                        id="title"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        maxLength={150}
                        className={inputClass}
                        placeholder="e.g. Vintage denim jacket"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className={labelClass}>
                        Description
                      </label>
                      <div className="relative">
                        <AlignLeft
                          size={17}
                          className="pointer-events-none absolute left-4 top-4 text-slate-600"
                        />
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={5}
                          maxLength={2000}
                          className={`${inputClass} resize-y pl-11`}
                          placeholder="Describe the product, material, style, and details shoppers should know..."
                        />
                      </div>
                      <p className="mt-2 text-right text-xs text-slate-600">
                        {formData.description.length}/2000
                      </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="price" className={labelClass}>
                          Price <span className="text-violet-300">*</span>
                        </label>
                        <div className="relative">
                          <IndianRupee
                            size={17}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                          />
                          <input
                            id="price"
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0.01"
                            step="0.01"
                            required
                            className={`${inputClass} pl-11`}
                            placeholder="999"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="category" className={labelClass}>
                          Category <span className="text-violet-300">*</span>
                        </label>
                        <div className="relative">
                          <Tag
                            size={17}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                          />
                          <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className={`${inputClass} appearance-none pl-11 pr-10`}
                          >
                            <option value="Clothing">Clothing</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Home Decor">Home Decor</option>
                            <option value="Footwear">Footwear</option>
                            <option value="Jewelry">Jewelry</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="instagram_post_url" className={labelClass}>
                        Instagram product post URL <span className="text-violet-300">*</span>
                      </label>
                      <input
                        id="instagram_post_url"
                        type="url"
                        name="instagram_post_url"
                        value={formData.instagram_post_url}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        placeholder="https://www.instagram.com/p/your-product-post/"
                      />
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Paste the direct URL of the Instagram post featuring this specific product.
                      </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="condition" className={labelClass}>
                          Condition
                        </label>
                        <select
                          id="condition"
                          name="condition"
                          value={formData.condition}
                          onChange={handleChange}
                          className={inputClass}
                        >
                          <option value="New">New</option>
                          <option value="Like New">Like New</option>
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="size" className={labelClass}>
                          Size
                        </label>
                        <input
                          id="size"
                          type="text"
                          name="size"
                          value={formData.size}
                          onChange={handleChange}
                          maxLength={50}
                          className={inputClass}
                          placeholder="S, M, L, Free size"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Image upload */}
                <section className="rounded-2xl border border-white/[0.08] bg-[#11162A] p-5 sm:p-7">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-300">
                      <ImagePlus size={20} />
                    </div>
                    <div>
                      <h2 className="font-semibold">Product image</h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Upload an image or paste an image URL
                      </p>
                    </div>
                  </div>

                  {!imagePreview ? (
                    <label
                      htmlFor="product-image"
                      className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-violet-400/25 bg-[#0C1122] px-5 py-8 text-center transition hover:border-violet-400/50 hover:bg-violet-500/[0.04]"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                        <Upload size={22} />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-slate-200">
                        Click to upload an image
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Image files up to 5 MB
                      </p>
                    </label>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0C1122]">
                      <div className="relative flex min-h-48 items-center justify-center p-4">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="max-h-72 max-w-full rounded-xl object-contain"
                          onError={() => {
                            setImagePreview("");
                            setError("This image URL could not be loaded. Try another URL or upload a file.");
                          }}
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#11162A]/95 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-rose-500/15 hover:text-rose-200"
                        >
                          <X size={14} /> Remove
                        </button>
                      </div>

                      <div className="flex items-center gap-2 border-t border-white/[0.07] px-4 py-3 text-xs text-emerald-300">
                        <CheckCircle2 size={15} />
                        Image selected for preview
                      </div>
                    </div>
                  )}

                  <input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />

                  <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/[0.07]" />
                    <span className="text-xs text-slate-600">OR USE AN IMAGE URL</span>
                    <div className="h-px flex-1 bg-white/[0.07]" />
                  </div>

                  <label htmlFor="image_url" className={labelClass}>
                    Image URL
                  </label>
                  <input
                    id="image_url"
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://example.com/product-image.jpg"
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    If you choose a local file, it will be uploaded instead of
                    the URL.
                  </p>
                </section>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Link
                    href="/vendor/dashboard"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle size={17} className="animate-spin" />
                        Publishing product...
                      </>
                    ) : (
                      <>
                        <PackagePlus size={17} />
                        Publish product
                      </>
                    )}
                    
                  </button>
                  
                </div>
                {error && (
                  <div
                    role="alert"
                    className={`rounded-2xl border p-4 ${
                      isLimitError
                        ? "border-amber-400/20 bg-amber-400/[0.07]"
                        : "border-rose-400/20 bg-rose-500/[0.07]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={20}
                        className={`mt-0.5 shrink-0 ${
                          isLimitError ? "text-amber-300" : "text-rose-300"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-semibold ${
                            isLimitError ? "text-amber-200" : "text-rose-200"
                          }`}
                        >
                          {isLimitError
                            ? "Product limit reached"
                            : "Couldn't publish product"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-300">
                          {error.message || String(error)}
                        </p>

                        {isLimitError && (
                          <Link
                            href="/vendor/subscription"
                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
                          >
                            Upgrade subscription
                            <ArrowUpRight size={15} />
                          </Link>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Dismiss error"
                        className="rounded-lg p-1 text-slate-500 hover:bg-white/5 hover:text-white"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right-hand preview and guidance */}
              <aside className="space-y-5 lg:sticky lg:top-6">
                <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11162A]">
                  <div className="border-b border-white/[0.07] px-5 py-4">
                    <p className="text-sm font-semibold">Listing preview</p>
                    <p className="mt-1 text-xs text-slate-500">
                      A quick look at your product
                    </p>
                  </div>

                  <div className="p-4">
                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-white/[0.07] bg-[#0C1122]">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt={formData.title || "Product preview"}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="text-center">
                          <ImagePlus
                            size={32}
                            className="mx-auto text-slate-700"
                          />
                          <p className="mt-3 text-xs text-slate-600">
                            Your image appears here
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <span className="inline-flex rounded-full border border-violet-400/15 bg-violet-500/10 px-2.5 py-1 text-[10px] font-medium text-violet-300">
                        {formData.category}
                      </span>

                      <h3 className="mt-3 break-words text-base font-semibold text-white">
                        {formData.title.trim() || "Your product title"}
                      </h3>

                      <p className="mt-2 line-clamp-3 min-h-12 whitespace-pre-wrap text-xs leading-5 text-slate-400">
                        {formData.description.trim() ||
                          "Your product description will appear here."}
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-4">
                        <p className="text-lg font-semibold text-white">
                          {formData.price
                            ? `₹${Number(formData.price).toLocaleString("en-IN")}`
                            : "₹0"}
                        </p>
                        <span className="rounded-lg bg-white/[0.05] px-2.5 py-1.5 text-xs text-slate-400">
                          {formData.condition}
                        </span>
                      </div>

                      {formData.size && (
                        <p className="mt-3 text-xs text-slate-500">
                          Size: <span className="text-slate-300">{formData.size}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.12] to-fuchsia-500/[0.04] p-5">
                  <div className="flex items-center gap-2 text-violet-200">
                    <Sparkles size={18} />
                    <h3 className="text-sm font-semibold">Make your listing stand out</h3>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {[
                      "Use a clear, high-quality product image.",
                      "Write a useful and accurate description.",
                      "Choose the category that best fits your product.",
                    ].map((tip) => (
                      <li
                        key={tip}
                        className="flex items-start gap-2.5 text-xs leading-5 text-slate-400"
                      >
                        <CheckCircle2
                          size={15}
                          className="mt-0.5 shrink-0 text-violet-300"
                        />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </section>

                <Link
                  href="/vendor/subscription"
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#11162A] p-4 transition hover:border-violet-400/25"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      Need more listings?
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Explore seller subscription plans
                    </p>
                  </div>
                  <ArrowUpRight size={18} className="shrink-0 text-violet-300" />
                </Link>
              </aside>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
