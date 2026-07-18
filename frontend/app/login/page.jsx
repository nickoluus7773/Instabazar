"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import API_BASE_URL from "@/lib/api";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const loginUser = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
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
        login(data.access);
        router.push("/");
      } else {
        alert(data.detail || data.error || "Invalid username or password");
      }
    } catch (error) {
      console.error("Login request failed:", error);
      alert(`Unable to reach the backend server. Make sure Django is running on ${API_BASE_URL}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="
              w-20 h-20
              rounded-3xl
              mx-auto
              flex items-center justify-center
              text-white
              font-black
              text-3xl
              shadow-xl
            "
            style={{
              background: "linear-gradient(135deg,#8b5cf6,#ec4899,#f97316)",
            }}
          >
            IB
          </div>

          <h1 className="text-6xl font-bold text-gray-900 mt-6">
            Welcome Back
          </h1>

          <p className="text-gray-500 text-xl mt-3">Sign in to your account</p>
        </div>

        {/* Card */}
        <div
          className="
            bg-white
            rounded-[32px]
            shadow-xl
            p-12
          "
        >
          <form onSubmit={loginUser} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Username
              </label>

              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="
                  w-full
                  h-16
                  px-5
                  rounded-2xl
                  border
                  border-gray-200
                  focus:outline-none
                  focus:ring-2
                  focus:ring-purple-500
                  text-lg
                "
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  w-full
                  h-16
                  px-5
                  rounded-2xl
                  border
                  border-gray-200
                  focus:outline-none
                  focus:ring-2
                  focus:ring-purple-500
                  text-lg
                "
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                h-16
                rounded-2xl
                text-white
                font-bold
                text-xl
                shadow-lg
                transition-all
                hover:scale-[1.01]
              "
              style={{
                background: "linear-gradient(90deg,#8b5cf6,#ec4899,#f97316)",
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-8 text-lg">
            Don&apos;t have an account?
            <Link
                href="/register"
                className="text-purple-600 font-semibold ml-2 cursor-pointer"
              >
                Sign Up
              </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
