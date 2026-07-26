"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/layout/Navbar";
import API_BASE_URL from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const registerUser = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.ok) {
        alert("Account created successfully");
        router.push("/login");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration request failed:", error);
      alert(
        `Unable to reach the backend server. Make sure Django is running on ${API_BASE_URL}.`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
    min-h-screen
    flex
    items-center
    justify-center
    px-4
    bg-center
    bg-cover
    bg-no-repeat
  "
      style={{
        backgroundImage: "url('/images/login-bg.png')",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}

        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4 mt-1"
            style={{
              background: "linear-gradient(135deg,#8b5cf6,#ec4899,#f97316)",
            }}
          >
            <span className="text-white font-black text-lg">IB</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
        </div>

        {/* Card */}

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={registerUser} className="space-y-4">
            {/* Username */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>

              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-14 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Email */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Password */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Confirm Password */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-14 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              style={{
                background: "linear-gradient(90deg,#8b5cf6,#ec4899,#f97316)",
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?
            <span
              onClick={() => router.push("/login")}
              className="text-purple-600 font-semibold ml-2 cursor-pointer"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
