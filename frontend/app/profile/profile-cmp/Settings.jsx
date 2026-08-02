"use client";

import { useState } from "react";
import { User, Mail, Lock, Moon, LogOut, Trash2, Save } from "lucide-react";

export default function Settings({ user }) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (form.newPassword !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch("http://127.0.0.1:8001/api/change-password/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: form.oldPassword,
          new_password: form.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);

        setForm((prev) => ({
          ...prev,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        alert(data.error || "Unable to change password.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure? This action cannot be undone.",
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch("http://127.0.0.1:8001/api/delete-account/", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);

        localStorage.removeItem("accessToken");

        window.location.href = "/login";
      } else {
        alert(data.error || "Unable to delete account.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Account Settings</h1>

      {/* Profile Information */}

      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 mb-2 font-medium">
              <User size={18} />
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              readOnly
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 mb-2 font-medium">
              <Mail size={18} />
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              readOnly
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Password */}

      {/* Password */}

      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-xl font-semibold mb-6">Change Password</h2>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 mb-2 font-medium">
              <Lock size={18} />
              Current Password
            </label>

            <input
              type="password"
              name="oldPassword"
              value={form.oldPassword}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 mb-2 font-medium">
              <Lock size={18} />
              New Password
            </label>

            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 mb-2 font-medium">
              <Lock size={18} />
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white py-4 rounded-2xl font-semibold flex justify-center items-center gap-2 hover:opacity-90 transition"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>
      </div>
      {/* Save */}

      {/* Preferences */}

      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-xl font-semibold mb-6">Preferences</h2>

        <div className="flex justify-between items-center border rounded-xl p-5">
          <div className="flex items-center gap-4">
            <Moon className="text-purple-600" />

            <div>
              <h3 className="font-semibold">Dark Mode</h3>

              <p className="text-sm text-gray-500">Coming Soon</p>
            </div>
          </div>

          <button
            disabled
            className="bg-gray-200 text-gray-500 px-5 py-2 rounded-lg cursor-not-allowed"
          >
            Soon
          </button>
        </div>
      </div>

      {/* Logout */}

      <button className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-semibold flex justify-center items-center gap-2 transition">
        <LogOut size={20} />
        Logout
      </button>

      {/* Delete */}

      <div className="bg-red-50 border border-red-200 rounded-3xl p-8">
        <h2 className="text-red-600 font-bold text-xl mb-3">Danger Zone</h2>

        <p className="text-gray-600 mb-6">
          Deleting your account is permanent. All your favorites, reviews and
          profile information will be removed.
        </p>

        <button
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition"
          onClick={handleDeleteAccount}
        >
          <Trash2 size={18} />
          Delete Account
        </button>
      </div>
    </div>
  );
}
