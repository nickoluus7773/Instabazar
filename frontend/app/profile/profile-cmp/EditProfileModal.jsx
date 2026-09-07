"use client";

import { useState } from "react";
import { X, Camera, Save } from "lucide-react";
import axios from "axios";
export default function EditProfileModal({ user, setUser, closeModal }) {
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");

      const res = await axios.put(
        "http://127.0.0.1:8000/api/profile/",
        {
          username: formData.username,
          bio: formData.bio,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUser(res.data);

      alert("Profile updated successfully!");

      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}

        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 px-8 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Edit Profile</h2>

          <button
            onClick={closeModal}
            className="text-white hover:scale-110 transition"
          >
            <X size={28} />
          </button>
        </div>

        {/* Body */}

        <div className="p-8 space-y-3">
          {/* Avatar */}

          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-purple-600 to-pink-500 shadow-xl flex items-center justify-center">
                <span className="text-5xl font-bold text-white">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            </div>
          </div>

          {/* Name */}

          <div>
            <label className="block mb-2 font-semibold">Full Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {/* Username */}

          <div>
            <label className="block mb-2 font-semibold">Username</label>

            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {/* Email */}

          <div>
            <label className="block mb-2 font-semibold">Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {/* Bio */}

          <div>
            <label className="block mb-2 font-semibold">Bio</label>

            <textarea
              rows={4}
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}

        <div className="px-8 py-6 bg-gray-50 flex justify-end gap-4">
          <button
            onClick={closeModal}
            className="px-6 py-3 rounded-xl border hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white px-8 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition"
            disabled={loading}
          >
            <Save size={18} />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
