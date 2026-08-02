"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API_BASE_URL from "@/lib/api";

export default function VendorRegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    business_name: "",
    instagram_handle: "",
    location: "",
    bio: "",
    logo_url: "",
    follower_count: "",
    subscription_plan: "free",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitVendorRegistration = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/register/vendor/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          business_name: form.business_name,
          instagram_handle: form.instagram_handle,
          location: form.location,
          bio: form.bio,
          logo_url: form.logo_url,
          follower_count: form.follower_count,
          subscription_plan: form.subscription_plan,
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.ok) {
        alert("Vendor registration submitted successfully. It will be reviewed by the admin.");
        router.push("/login");
      } else {
        alert(data.error || "Vendor registration failed");
      }
    } catch (error) {
      console.error("Vendor registration failed:", error);
      alert(`Unable to reach the backend server. Make sure Django is running on ${API_BASE_URL}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Register as a Vendor</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create your account and submit your vendor profile. Admin approval is still required.
          </p>
        </div>

        <form onSubmit={submitVendorRegistration} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Username</label>
              <input name="username" value={form.username} onChange={handleChange} required className="h-12 w-full rounded-2xl border border-gray-200 px-4" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required className="h-12 w-full rounded-2xl border border-gray-200 px-4" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required className="h-12 w-full rounded-2xl border border-gray-200 px-4" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Confirm Password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required className="h-12 w-full rounded-2xl border border-gray-200 px-4" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Business Name</label>
              <input name="business_name" value={form.business_name} onChange={handleChange} required className="h-12 w-full rounded-2xl border border-gray-200 px-4" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Instagram Handle</label>
              <input name="instagram_handle" value={form.instagram_handle} onChange={handleChange} className="h-12 w-full rounded-2xl border border-gray-200 px-4" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Location</label>
              <input name="location" value={form.location} onChange={handleChange} className="h-12 w-full rounded-2xl border border-gray-200 px-4" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Subscription Plan</label>
              <select name="subscription_plan" value={form.subscription_plan} onChange={handleChange} className="h-12 w-full rounded-2xl border border-gray-200 px-4">
                <option value="free">Free</option>
                <option value="paid">Premium</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows="4" className="w-full rounded-2xl border border-gray-200 px-4 py-3" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Logo URL</label>
            <input name="logo_url" value={form.logo_url} onChange={handleChange} className="h-12 w-full rounded-2xl border border-gray-200 px-4" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Follower Count</label>
            <input type="number" min="0" name="follower_count" value={form.follower_count} onChange={handleChange} className="h-12 w-full rounded-2xl border border-gray-200 px-4" />
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 py-4 font-bold text-white shadow-lg transition-all hover:shadow-xl">
            {loading ? "Submitting..." : "Create Vendor Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <span onClick={() => router.push("/login")} className="ml-2 cursor-pointer font-semibold text-purple-600">
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}
