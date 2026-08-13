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
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();

  const loginUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

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

      if (response.ok && data.access) {
        login(data.access);
        router.push("/");
      } else {
        const msg = data.detail || data.error || "Invalid username or password";
        setErrorMessage(msg);
        alert(msg);
      }
    } catch (error) {
      console.error("Login request failed:", error);
      const msg = `Unable to reach backend at ${API_BASE_URL}. Ensure Django is running on port 8000.`;
      setErrorMessage(msg);
      alert(msg);
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
        <div className="text-center mb-8">
          <div
            className="
              w-15 h-15
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

          <h3 className="text-5xl font-bold text-gray-900 mt-2">
            Welcome Back
          </h3>
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
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium text-center">
              {errorMessage}
            </div>
          )}

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
                required
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
                required
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
