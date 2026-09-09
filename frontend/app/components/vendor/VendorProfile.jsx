"use client";

import { useState, useEffect } from "react";
import { getVendorProfile, updateVendorProfile } from "@/lib/vendorApi";
import { useAuth } from "@/context/AuthContext";

export default function VendorProfile() {
  const { isLoggedIn } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const data = await getVendorProfile(token);
      setProfile(data);
      setFormData(data);
      setImagePreview(data.logo_url || "");
    } catch (err) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, profile_image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "profile_image" && value !== null && value !== undefined) {
          payload.append(key, value);
        }
      });
      if (formData.profile_image instanceof File) {
        payload.append("profile_image", formData.profile_image);
      }
      const updated = await updateVendorProfile(token, payload);
      setProfile(updated);
      setEditing(false);
      setError(null);
    } catch (err) {
      setError("Failed to update profile");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (!profile) {
    return <div className="p-6 text-center">No profile found</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Business Profile</h2>
        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              name="business_name"
              value={formData.business_name || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-600"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Vendor profile preview"
                className="mt-3 h-24 w-24 rounded-full object-cover"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram Handle
            </label>
            <input
              type="text"
              name="instagram_handle"
              value={formData.instagram_handle || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio || ""}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Save Changes
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Business Name</p>
              <p className="text-lg font-semibold text-gray-900">
                {profile.business_name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Instagram Handle</p>
              <p className="text-lg font-semibold text-gray-900">
                {profile.instagram_handle || "Not set"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="text-lg font-semibold text-gray-900">
                {profile.location || "Not set"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Followers</p>
              <p className="text-lg font-semibold text-gray-900">
                {profile.follower_count || 0}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">Bio</p>
            <p className="text-gray-900">{profile.bio || "No bio added"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Verification Status</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                profile.verification_status === "verified"
                  ? "bg-green-100 text-green-800"
                  : profile.verification_status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {profile.verification_status.charAt(0).toUpperCase() +
                profile.verification_status.slice(1)}
            </span>
          </div>

          {profile.logo_url && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Store Logo</p>
              <img
                src={profile.logo_url}
                alt="Store Logo"
                className="h-24 w-24 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
