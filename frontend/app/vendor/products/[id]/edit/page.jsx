
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { updateProduct, getVendorProducts } from "@/lib/vendorApi";
import { getImageUrl } from "@/lib/imageHelper";
import Navbar from "@/app/components/layout/Navbar";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Package,
  IndianRupee,
  Tag,
  AlignLeft,
  AlertCircle,
  X,
  Upload,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0C1122] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/15";

const labelClass = "mb-2 block text-sm font-medium text-slate-300";

export default function EditProduct() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    size: "",
    image_url: "",
    instagram_post_url: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function fetchProduct() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");
      const data = await getVendorProducts(token, 1, 100);
      const product = data.results?.find(
        (item) => item.id === parseInt(productId, 10)
      );

      if (!product) {
        setError("Product not found in your current product list.");
        return;
      }

      const image = product.productImage || "";

      setFormData({
        title: product.productTitle || "",
        description: product.productDescription || "",
        price: product.productPrice ?? "",
        category: product.category || "",
        size: product.productSize || "",
        image_url: image,
        instagram_post_url: product.instagram_post_url || "",
      });

      setImagePreview(image ? getImageUrl(image) : "");
    } catch (err) {
      setError("Failed to load product. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isLoggedIn && productId) {
      void Promise.resolve().then(() => fetchProduct());
    }
  }, [isLoggedIn, productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "image_url") {
      setImagePreview(value);
      setImageFile(null);
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

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((previous) => ({
      ...previous,
      image_url: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "image_url") {
          payload.append(key, value);
        }
      });

      if (imageFile) {
        payload.append("productImage", imageFile);
      } else {
        payload.append("image_url", formData.image_url);
      }

      await updateProduct(token, productId, payload);
      router.push("/vendor/products");
    } catch (err) {
      setError(err?.message || "Failed to update product. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[75vh] items-center justify-center bg-[#090D1A] px-4 text-white">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11162A] p-8 text-center">
            <Package className="mx-auto text-violet-300" size={36} />
            <h1 className="mt-4 text-xl font-semibold">Sign in to continue</h1>
            <p className="mt-2 text-sm text-slate-400">
              Log in to edit your product listing.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold hover:bg-violet-500"
            >
              Go to login <ArrowUpRight size={16} />
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[75vh] items-center justify-center bg-[#090D1A] text-white">
          <div className="text-center">
            <LoaderCircle
              size={30}
              className="mx-auto animate-spin text-violet-400"
            />
            <p className="mt-4 text-sm text-slate-400">Loading product...</p>
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
          <Link
            href="/vendor/products"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-violet-300"
          >
            <ArrowLeft size={16} />
            Back to products
          </Link>

          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300">
              <Sparkles size={14} />
              Seller workspace
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Edit product
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
              Update your listing details and keep your storefront looking its best.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-500/[0.07] p-4 text-rose-200"
            >
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm leading-6">{error}</p>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
                className="rounded-lg p-1 text-slate-500 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {error.includes("not found") ? (
            <section className="rounded-2xl border border-white/[0.08] bg-[#11162A] p-8 text-center">
              <Package size={32} className="mx-auto text-slate-600" />
              <p className="mt-4 text-sm text-slate-400">
                Return to your product list to find the listing you want to edit.
              </p>
              <Link
                href="/vendor/products"
                className="mt-5 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold hover:bg-violet-500"
              >
                View products
              </Link>
            </section>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-6">
                  <section className="rounded-2xl border border-white/[0.08] bg-[#11162A] p-5 sm:p-7">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                        <Package size={20} />
                      </div>
                      <div>
                        <h2 className="font-semibold">Product details</h2>
                        <p className="mt-1 text-xs text-slate-500">
                          Update the information shown to shoppers
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label htmlFor="title" className={labelClass}>
                          Product title
                        </label>
                        <input
                          id="title"
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                          className={inputClass}
                          placeholder="Enter product title"
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
                            className={`${inputClass} resize-y pl-11`}
                            placeholder="Describe your product..."
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="instagram_post_url" className={labelClass}>
                          Instagram product post URL <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          id="instagram_post_url"
                          type="url"
                          name="instagram_post_url"
                          value={formData.instagram_post_url}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="https://www.instagram.com/p/your-product-post/"
                        />
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Paste the direct URL of the Instagram post featuring this specific product.
                        </p>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="price" className={labelClass}>
                            Price (₹)
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
                              min="0"
                              step="0.01"
                              required
                              className={`${inputClass} pl-11`}
                              placeholder="999"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="category" className={labelClass}>
                            Category
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
                              className={`${inputClass} pl-11`}
                            >
                              <option value="">Select a category</option>
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
                        <label htmlFor="size" className={labelClass}>
                          Size
                        </label>
                        <input
                          id="size"
                          type="text"
                          name="size"
                          value={formData.size}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="e.g. M or Free Size"
                        />
                      </div>

                      <div>
                        <label htmlFor="instagram_post_url" className={labelClass}>
                          Instagram Post or Reel URL
                        </label>
                        <input
                          id="instagram_post_url"
                          type="url"
                          name="instagram_post_url"
                          value={formData.instagram_post_url}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="https://www.instagram.com/p/..."
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          Direct Instagram post/reel link where buyers can connect via DM.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-white/[0.08] bg-[#11162A] p-5 sm:p-7">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-300">
                        <ImagePlus size={20} />
                      </div>
                      <div>
                        <h2 className="font-semibold">Product image</h2>
                        <p className="mt-1 text-xs text-slate-500">
                          Replace the existing image or keep it as is
                        </p>
                      </div>
                    </div>

                    {imagePreview ? (
                      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0C1122]">
                        <div className="relative flex min-h-48 items-center justify-center p-4">
                          <img
                            src={imagePreview}
                            alt="Product preview"
                            className="max-h-72 max-w-full rounded-xl object-contain"
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
                          {imageFile ? imageFile.name : "Current product image"}
                        </div>
                      </div>
                    ) : (
                      <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-violet-400/25 bg-[#0C1122] p-6 text-center">
                        <ImagePlus size={28} className="text-slate-600" />
                        <p className="mt-3 text-sm text-slate-400">
                          No image selected
                        </p>
                      </div>
                    )}

                    <div className="mt-5">
                      <label htmlFor="image_url" className={labelClass}>
                        Image URL
                      </label>
                      <input
                        id="image_url"
                        type="url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleChange}
                        disabled={Boolean(imageFile)}
                        className={`${inputClass} disabled:opacity-50`}
                        placeholder="https://example.com/product-image.jpg"
                      />
                    </div>

                    <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.04] hover:text-white">
                      <Upload size={16} />
                      Choose a new image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      Choose a local image file or provide an image URL. Removing
                      the image leaves the image field empty when you save.
                    </p>
                  </section>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Link
                      href="/vendor/products"
                      className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <LoaderCircle size={17} className="animate-spin" />
                          Saving changes...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={17} />
                          Save changes
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <aside className="space-y-5 lg:sticky lg:top-6">
                  <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11162A]">
                    <div className="border-b border-white/[0.07] px-5 py-4">
                      <p className="text-sm font-semibold">Listing preview</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Preview your changes
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
                          <ImagePlus size={30} className="text-slate-700" />
                        )}
                      </div>

                      <span className="mt-4 inline-flex rounded-full border border-violet-400/15 bg-violet-500/10 px-2.5 py-1 text-[10px] font-medium text-violet-300">
                        {formData.category || "Category"}
                      </span>

                      <h3 className="mt-3 break-words font-semibold text-white">
                        {formData.title || "Your product title"}
                      </h3>

                      <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-xs leading-5 text-slate-400">
                        {formData.description || "Your product description"}
                      </p>

                      <div className="mt-4 border-t border-white/[0.07] pt-4">
                        <p className="text-xl font-semibold text-white">
                          {formData.price
                            ? `₹${Number(formData.price).toLocaleString("en-IN")}`
                            : "₹0"}
                        </p>
                        {formData.size && (
                          <p className="mt-2 text-xs text-slate-500">
                            Size: <span className="text-slate-300">{formData.size}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.12] to-fuchsia-500/[0.04] p-5">
                    <div className="flex items-center gap-2 text-violet-200">
                      <ShieldCheck size={18} />
                      <h3 className="text-sm font-semibold">
                        Keep your listing accurate
                      </h3>
                    </div>
                    <p className="mt-3 text-xs leading-6 text-slate-400">
                      Make sure the title, price, category, and image correctly
                      represent the product you are sharing with shoppers.
                    </p>
                  </section>

                  <Link
                    href="/vendor/products"
                    className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#11162A] p-4 transition hover:border-violet-400/25"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        Back to your listings
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Review all your products
                      </p>
                    </div>
                    <ArrowUpRight size={18} className="text-violet-300" />
                  </Link>
                </aside>
              </div>
            </form>
          )}

          <footer className="mt-8 flex flex-col gap-2 border-t border-white/[0.07] pt-5 text-xs text-slate-600 sm:flex-row sm:justify-between">
            <span>InstaBazaar Seller Workspace</span>
            <span>Product listing editor</span>
          </footer>
        </div>
      </main>
    </>
  );
}
