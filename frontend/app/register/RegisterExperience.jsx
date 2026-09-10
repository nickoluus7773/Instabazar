"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, AtSign, BriefcaseBusiness, Check, ShoppingBag, Sparkles } from "lucide-react";
import API_BASE_URL from "@/lib/api";
import Navbar from "../components/layout/Navbar";

const userFields = [
  { name: "username", label: "Username", type: "text", placeholder: "Choose a username", required: true },
  { name: "email", label: "Email address", type: "email", placeholder: "you@example.com", required: true },
  { name: "password", label: "Password", type: "password", placeholder: "Create a password", required: true },
  { name: "confirmPassword", label: "Confirm password", type: "password", placeholder: "Repeat your password", required: true },
];

const vendorFields = [
  { name: "username", label: "Username", type: "text", placeholder: "Choose a username", required: true },
  { name: "email", label: "Email address", type: "email", placeholder: "you@example.com", required: true },
  { name: "password", label: "Password", type: "password", placeholder: "Create a password", required: true },
  { name: "confirmPassword", label: "Confirm password", type: "password", placeholder: "Repeat your password", required: true },
  { name: "business_name", label: "Business name", type: "text", placeholder: "Your store name", required: true },
  { name: "instagram_handle", label: "Instagram handle", type: "text", placeholder: "@yourstore" },
  { name: "location", label: "Location", type: "text", placeholder: "City, country" },
  { name: "follower_count", label: "Follower count", type: "number", placeholder: "0", min: "0" },
];

function Field({ field, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{field.label}</span>
      <input
        type={field.type}
        name={field.name}
        value={value}
        onChange={onChange}
        placeholder={field.placeholder}
        min={field.min}
        required={field.required}
        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10"
      />
    </label>
  );
}

export default function RegisterExperience({ initialMode = "user" }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [userForm, setUserForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [vendorForm, setVendorForm] = useState({
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
    profile_image: null,
  });
  const [loading, setLoading] = useState(false);
  const [vendorImagePreview, setVendorImagePreview] = useState("");

  const switchMode = (nextMode) => {
    setMode(nextMode);
    window.history.replaceState(null, "", nextMode === "vendor" ? "/register/vendor" : "/register");
  };

  const updateUser = (event) => {
    setUserForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const updateVendor = (event) => {
    setVendorForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const updateVendorImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setVendorForm((current) => ({ ...current, profile_image: file }));
    setVendorImagePreview(URL.createObjectURL(file));
  };

  const registerUser = async (event) => {
    event.preventDefault();
    if (userForm.password !== userForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userForm.username, email: userForm.email, password: userForm.password }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        alert("Account created successfully");
        router.push("/login");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration request failed:", error);
      alert(`Unable to reach the backend server. Make sure Django is running on ${API_BASE_URL}.`);
    } finally {
      setLoading(false);
    }
  };

  const registerVendor = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token && vendorForm.password !== vendorForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(vendorForm).forEach(([key, value]) => {
        if (key !== "profile_image" && key !== "confirmPassword" && value !== null && value !== undefined) {
          payload.append(key, value);
        }
      });
      if (vendorForm.profile_image) {
        payload.append("profile_image", vendorForm.profile_image);
      }

      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/api/register/vendor/`, {
        method: "POST",
        headers,
        body: payload,
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        alert("Vendor profile created successfully!");
        router.push(token ? "/vendor/dashboard" : "/login");
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

  const isVendor = mode === "vendor";
  const fields = isVendor ? vendorFields : userFields;
  const values = isVendor ? vendorForm : userForm;
  const updateForm = isVendor ? updateVendor : updateUser;

  return (
    <>
    <Navbar/>
    <main className="bg-[#081225] text-slate-900 ">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-[#F5AE30]/30 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
          <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/30 blur-3xl" />
            <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-orange-400/20 blur-3xl" />
            <div className="relative">
              
              <Link href="/" className="text-3xl font-bold">
          <span className="text-white">Insta</span>
          <span className="text-[#F5AE30]">Bazaar</span>
        </Link>
              <div className="mt-24 max-w-sm">
                <p className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-fuchsia-200"><Sparkles size={16} /> One account, two ways to belong</p>
                <h1 className="text-5xl font-black leading-[0.98] tracking-tight">Find your place in the bazaar.</h1>
                <p className="mt-6 text-base leading-7 text-slate-300">Shop the best finds or bring your own collection to life. Switch sides whenever you are ready.</p>
              </div>
            </div>
            <div className="relative flex items-center gap-3 text-sm text-slate-300"><AtSign size={18} className="text-pink-300" /> Built for the way you discover and sell.</div>
          </section>

          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="text-xl font-black">Insta<span className="text-fuchsia-600">Bazaar</span></Link>
            </div>
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-fuchsia-600">Join InstaBazaar</p>
                <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Create your account</h2>
                <p className="mt-2 text-sm text-slate-500">Choose the path that fits you best.</p>
              </div>
              <div className="hidden rounded-2xl bg-slate-100 p-3 text-fuchsia-600 sm:block">{isVendor ? <BriefcaseBusiness size={22} /> : <ShoppingBag size={22} />}</div>
            </div>

            <div className="relative mb-8 grid grid-cols-2 rounded-2xl bg-slate-100 p-1.5" role="tablist" aria-label="Account type">
              <span className={`pointer-events-none absolute bottom-1.5 left-1.5 top-1.5 w-[calc(50%-0.375rem)] rounded-xl bg-white shadow-sm transition-transform duration-500 ease-out ${isVendor ? "translate-x-full" : "translate-x-0"}`} />
              <button type="button" onClick={() => switchMode("user")} role="tab" aria-selected={!isVendor} className={`relative z-10 rounded-xl px-3 py-3 text-sm font-bold transition-colors ${!isVendor ? "text-slate-950" : "text-slate-500 hover:text-slate-800"}`}><ShoppingBag size={16} className="mr-2 inline" /> I&apos;m shopping</button>
              <button type="button" onClick={() => switchMode("vendor")} role="tab" aria-selected={isVendor} className={`relative z-10 rounded-xl px-3 py-3 text-sm font-bold transition-colors ${isVendor ? "text-slate-950" : "text-slate-500 hover:text-slate-800"}`}><BriefcaseBusiness size={16} className="mr-2 inline" /> I&apos;m selling</button>
            </div>

            <div className="relative overflow-hidden">
              <div className={`transition-all duration-500 ${isVendor ? "translate-x-0 opacity-100" : "translate-x-0 opacity-100"}`}>
                <form onSubmit={isVendor ? registerVendor : registerUser} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {fields.map((field) => <Field key={field.name} field={field} value={values[field.name]} onChange={updateForm} />)}
                  </div>
                  {isVendor && (
                    <>
                      <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Subscription plan</span><select name="subscription_plan" value={vendorForm.subscription_plan} onChange={updateVendor} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-fuchsia-500"><option value="free">Free plan</option><option value="paid">Premium plan</option></select></label>
                      <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Store bio</span><textarea name="bio" value={vendorForm.bio} onChange={updateVendor} rows="3" placeholder="Tell shoppers what makes your store special" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-fuchsia-500" /></label>
                      <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Logo URL <span className="font-normal text-slate-400">(optional)</span></span><input name="logo_url" value={vendorForm.logo_url} onChange={updateVendor} placeholder="https://..." className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none placeholder:text-slate-400 focus:border-fuchsia-500" /></label>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <label className="block text-sm font-semibold text-slate-700">
                          Or upload a logo from your device
                          <input type="file" name="profile_image" accept="image/*" onChange={updateVendorImage} className="mt-2 block w-full text-sm text-slate-600" />
                        </label>
                        {vendorImagePreview && <img src={vendorImagePreview} alt="Logo preview" className="mt-3 h-24 w-24 rounded-2xl object-cover" />}
                        <p className="mt-2 text-xs text-slate-500">Choose either a URL or a local image. A local image takes priority.</p>
                      </div>
                    </>
                  )}
                  <button type="submit" disabled={loading} className="group mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 font-bold text-white shadow-lg shadow-slate-950/15 transition hover:bg-fuchsia-600 disabled:cursor-wait disabled:opacity-70">{loading ? "Creating your account..." : isVendor ? "Create vendor account" : "Create shopper account"}<ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></button>
                </form>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6 text-sm text-slate-500"><span>Already have an account?</span><Link href="/login" className="font-bold text-fuchsia-600 hover:text-fuchsia-700">Sign in <Check size={15} className="ml-1 inline" /></Link></div>
          </section>
        </div>
      </div>
    </main>
    </>
  );
}
