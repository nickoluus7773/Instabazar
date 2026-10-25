
"use client";

import { useState, useEffect } from "react";
import { getVendorProfile, updateVendorProfile } from "@/lib/vendorApi";
import { useAuth } from "@/context/AuthContext";
import { FaInstagram } from "react-icons/fa";
import {
  Store,
  MapPin,
  Users,
  ShieldCheck,
  Clock3,
  CircleAlert,
  Pencil,
  Save,
  X,
  ImagePlus,
  Upload,
  UserRound,
  AlignLeft,
  CheckCircle2,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0C1122] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/15";

const labelClass = "mb-2 block text-sm font-medium text-slate-300";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const getImageUrl = (image) => {
  if (!image) return "";
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }
  return `${API_BASE_URL.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
};

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0C1122]/70 p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-medium text-white">
        {value || "Not set"}
      </p>
    </div>
  );
}

export default function VendorProfile() {
  const { isLoggedIn } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      const data = await getVendorProfile(token);

      setProfile(data);
      setFormData(data);
      setImagePreview(data.logo_url ? getImageUrl(data.logo_url) : "");
    } catch (err) {
      setError("Failed to load profile. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError(null);
    setSuccess("");
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
      profile_image: file,
    }));

    setImagePreview(URL.createObjectURL(file));
    setError(null);
    setSuccess("");
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setImagePreview(
      profile?.logo_url ? getImageUrl(profile.logo_url) : ""
    );
    setEditing(false);
    setError(null);
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess("");

    try {
      const token = localStorage.getItem("accessToken");
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (
          key !== "profile_image" &&
          value !== null &&
          value !== undefined
        ) {
          payload.append(key, value);
        }
      });

      if (formData.profile_image instanceof File) {
        payload.append("profile_image", formData.profile_image);
      }

      const updated = await updateVendorProfile(token, payload);

      setProfile(updated);
      setFormData(updated);
      setImagePreview(
        updated.logo_url ? getImageUrl(updated.logo_url) : ""
      );
      setEditing(false);
      setSuccess("Your store profile has been updated successfully.");
    } catch (err) {
      setError("Failed to update profile. Please check your details and try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center text-white">
        <LoaderCircle size={30} className="animate-spin text-violet-400" />
        <p className="mt-4 text-sm text-slate-400">Loading store profile...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="rounded-2xl border border-rose-400/20 bg-rose-500/[0.07] p-6 text-center">
        <CircleAlert size={28} className="mx-auto text-rose-300" />
        <p className="mt-3 text-sm text-rose-200">{error}</p>
        <button
          type="button"
          onClick={fetchProfile}
          className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-[#0C1122] p-8 text-center">
        <Store size={30} className="mx-auto text-slate-600" />
        <p className="mt-3 text-sm text-slate-400">No profile found.</p>
      </div>
    );
  }

  const verificationStatus = String(
    profile.verification_status || "pending"
  ).toLowerCase();

  const statusStyles =
    verificationStatus === "verified"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : verificationStatus === "pending"
      ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
      : "border-rose-400/20 bg-rose-400/10 text-rose-300";

  const StatusIcon =
    verificationStatus === "verified"
      ? ShieldCheck
      : verificationStatus === "pending"
      ? Clock3
      : CircleAlert;

  return (
    <div className="space-y-6 text-white">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-500/[0.07] p-4 text-rose-200"
        >
          <CircleAlert size={18} className="mt-0.5 shrink-0" />
          <p className="flex-1 text-sm leading-5">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="text-slate-500 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] p-4 text-emerald-200"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <p className="flex-1 text-sm leading-5">{success}</p>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
            className="text-slate-500 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Profile identity */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C1122]">
        <div className="h-24 bg-gradient-to-r from-violet-600/30 via-purple-500/10 to-fuchsia-500/20 sm:h-32" />

        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 items-end gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-[#0C1122] bg-[#1B2140] text-2xl font-semibold text-violet-200 sm:h-24 sm:w-24">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Store logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Store size={32} />
                )}
              </div>

              <div className="min-w-0 pb-1">
                <h2 className="break-words text-xl font-semibold sm:text-2xl">
                  {profile.business_name || "Your store"}
                </h2>
                <p className="mt-1 truncate text-sm text-slate-400">
                  {profile.instagram_handle
                    ? `@${profile.instagram_handle.replace(/^@/, "")}`
                    : "Instagram handle not set"}
                </p>
              </div>
            </div>

            {!editing && (
              <button
                type="button"
                onClick={() => {
                  setFormData(profile);
                  setImagePreview(
                    profile.logo_url ? getImageUrl(profile.logo_url) : ""
                  );
                  setEditing(true);
                  setError(null);
                  setSuccess("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                <Pencil size={16} />
                Edit profile
              </button>
            )}
          </div>

          <div className="mt-5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${statusStyles}`}
            >
              <StatusIcon size={14} />
              {verificationStatus}
            </span>
          </div>
        </div>
      </section>

      {editing ? (
        /* Edit form */
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-white/[0.08] bg-[#11162A] p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                <Store size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Business information</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Update your public storefront details
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="business_name" className={labelClass}>
                  Business name
                </label>
                <input
                  id="business_name"
                  type="text"
                  name="business_name"
                  value={formData.business_name || ""}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Your business name"
                />
              </div>

              <div>
                <label className={labelClass}>Store logo</label>
                <div className="flex flex-col gap-4 rounded-xl border border-dashed border-violet-400/20 bg-[#0C1122] p-4 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#171D35]">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Store logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus size={25} className="text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">
                      Upload your store logo
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Choose an image file up to 5 MB.
                    </p>
                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.04] hover:text-white">
                      <Upload size={14} />
                      Choose image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="instagram_handle" className={labelClass}>
                  Instagram handle
                </label>
                <div className="relative">
                  
                  <input
                    id="instagram_handle"
                    type="text"
                    name="instagram_handle"
                    value={formData.instagram_handle || ""}
                    onChange={handleChange}
                    className={`${inputClass} pl-11`}
                    placeholder="yourstore"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className={labelClass}>
                  Location
                </label>
                <div className="relative">
                  <MapPin
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    id="location"
                    type="text"
                    name="location"
                    value={formData.location || ""}
                    onChange={handleChange}
                    className={`${inputClass} pl-11`}
                    placeholder="City or region"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className={labelClass}>
                  Store bio
                </label>
                <div className="relative">
                  <AlignLeft
                    size={17}
                    className="pointer-events-none absolute left-4 top-4 text-slate-500"
                  />
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio || ""}
                    onChange={handleChange}
                    rows={5}
                    maxLength={1000}
                    className={`${inputClass} resize-y pl-11`}
                    placeholder="Tell shoppers about your store..."
                  />
                </div>
                <p className="mt-2 text-right text-xs text-slate-600">
                  {(formData.bio || "").length}/1000
                </p>
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Saving changes...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Read-only profile */
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/[0.08] bg-[#11162A] p-5 sm:p-7">
            <div className="mb-5">
              <h3 className="font-semibold">Business details</h3>
              <p className="mt-1 text-xs text-slate-500">
                Information associated with your storefront
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard
                icon={Store}
                label="Business name"
                value={profile.business_name}
              />
              <InfoCard
                icon={FaInstagram}
                label="Instagram handle"
                value={
                  profile.instagram_handle
                    ? `@${profile.instagram_handle.replace(/^@/, "")}`
                    : "Not set"
                }
              />
              <InfoCard
                icon={MapPin}
                label="Location"
                value={profile.location}
              />
              <InfoCard
                icon={Users}
                label="Followers"
                value={
                  profile.follower_count == null
                    ? "Not available"
                    : Number(profile.follower_count).toLocaleString("en-IN")
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-[#11162A] p-5 sm:p-7">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                <UserRound size={19} />
              </div>
              <div>
                <h3 className="font-semibold">About your store</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Your business introduction
                </p>
              </div>
            </div>

            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-400">
              {profile.bio || "No bio added yet."}
            </p>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-[#11162A] p-5 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                <ShieldCheck size={21} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Vendor verification</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Your current verification status on InstaBazaar.
                </p>
              </div>
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${statusStyles}`}
              >
                <StatusIcon size={14} />
                {verificationStatus}
              </span>
            </div>
          </section>

          {profile.logo_url && (
            <section className="rounded-2xl border border-white/[0.08] bg-[#11162A] p-5 sm:p-7">
              <h3 className="font-semibold">Store logo</h3>
              <p className="mt-1 text-xs text-slate-500">
                Your current storefront image
              </p>
              <div className="mt-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0C1122]">
                <img
                  src={getImageUrl(profile.logo_url)}
                  alt="Store logo"
                  className="h-full w-full object-cover"
                />
              </div>
            </section>
          )}

          <div className="rounded-xl border border-violet-400/10 bg-violet-500/[0.04] p-4">
            <div className="flex items-start gap-3">
              <Sparkles size={17} className="mt-0.5 shrink-0 text-violet-300" />
              <p className="text-xs leading-6 text-slate-400">
                Keep your business name, Instagram handle, and bio up to date
                so shoppers can recognize your storefront.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
