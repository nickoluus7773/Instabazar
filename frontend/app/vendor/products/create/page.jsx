"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createProduct } from "@/lib/vendorApi";

export default function CreateProduct() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [imagePreview, setImagePreview] = useState("");

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to access this page</p>
          <Link href="/login" className="text-blue-600 font-semibold">
            Go to Login →
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "image_url") {
      setImagePreview(value);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setImagePreview(base64Data);
        setFormData((prev) => ({
          ...prev,
          image_url: base64Data,
          image: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setFormData((prev) => ({
      ...prev,
      image_url: "",
      image: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("price", formData.price);
      payload.append("category", formData.category);
      payload.append("stock", formData.stock);
      payload.append("condition", formData.condition);
      payload.append("size", formData.size);
      if (formData.image) {
        payload.append("productImage", formData.image);
      } else {
        payload.append("image_url", formData.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600");
      }

      await createProduct(token, payload);
      alert("Product published successfully! Viewing in Gallery.");
      router.push("/gallery");
    } catch (err) {
      setError(err?.message || "Failed to create product. Please check your inputs and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/vendor/dashboard"
          className="text-purple-600 font-semibold mb-6 inline-block hover:text-purple-700"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add New Product
          </h1>
          <p className="text-gray-500 mb-6">
            Fill in the details to publish a new product to the marketplace
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. Vintage Denim Jacket"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter product description, fabric, styling tips..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Clothing">Clothing</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Home Decor">Home Decor</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Vintage">Vintage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. S, M, L, Free Size"
                />
              </div>
            </div>

            {/* Product Image Selection: URL & System File Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image (Enter URL or Choose from System)
              </label>

              <div className="relative flex items-center">
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url.startsWith("data:") ? "[Local Image File Selected]" : formData.image_url}
                  onChange={handleChange}
                  className="w-full pl-4 pr-14 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="Paste image URL (https://...) or click file icon"
                />

                {/* Hidden Native File Input */}
                <input
                  type="file"
                  id="systemFileInput"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {/* End-Adornment System File Picker Button */}
                <label
                  htmlFor="systemFileInput"
                  title="Choose image from system files"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg cursor-pointer transition flex items-center justify-center border border-purple-200"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v12zm-9-2l2.5-3.01L14.5 16l3.5-4.51 4.5 6H5z"/>
                  </svg>
                </label>
              </div>

              {/* Live Preview Thumbnail */}
              {imagePreview && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-gray-300 shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/200x200?text=Preview";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {formData.image ? formData.image.name : "Image URL Preview"}
                    </p>
                    <p className="text-xs text-gray-500">Ready to publish</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 bg-red-50 rounded-md transition"
                  >
                    ✕ Remove
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-1">
                You can paste any web image URL or click the 🖼️ icon to browse local files from your device.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50 font-bold shadow-md cursor-pointer"
              >
                {loading ? "Publishing Product..." : "Publish Product"}
              </button>
              <Link
                href="/vendor/dashboard"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all text-center font-semibold"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
