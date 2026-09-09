"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import API_BASE_URL from "@/lib/api";
import Link from "next/link";
import Navbar from "../components/layout/Navbar";

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
    <>
      <Navbar />
  
      <main className="min-h-[calc(100vh-64px)] bg-[#081225] text-white relative overflow-hidden">
        {/* Background glow - top right */}
        <div className="absolute right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
  
        {/* Background glow - bottom left */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-700/15 rounded-full blur-3xl pointer-events-none" />
  
        <div className="relative min-h-[calc(100vh-64px)] max-w-7xl mx-auto px-6 lg:px-10 flex items-center">
          <div className="w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-3">
  
            {/* =====================================================
                LEFT SIDE - SHOP ILLUSTRATION
            ====================================================== */}
            <div className="hidden lg:flex flex-col items-center justify-center">
  
              <div className="relative w-full max-w-[600px]">
  
                {/* Glow behind illustration */}
                <div className="absolute inset-10 bg-purple-600/20 blur-3xl rounded-full" />
  
                <img
                  src="/images/loginimg.png"
                  alt="InstaBazaar marketplace"
                  className="
                    relative
                    w-500px
                    h-500px
                    drop-shadow-[0_0_35px_rgba(139,92,246,0.25)]
                  "
                />
              </div>
  
              {/* Small tagline */}
              <div className="mt-2 text-center">
                <p className="text-xs tracking-[0.35em] uppercase text-gray-500">
                  A Marketplace For Real People
                </p>
  
                <div className="w-14 h-[2px] bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mt-4 rounded-full" />
              </div>
              
              {/* Bottom tagline */}
              <div className="flex items-center justify-center gap-3 mt-7 text-xs text-gray-600">
                <span className="w-8 h-px bg-gray-700" />
                <span>Discover</span>
                <span>•</span>
                <span>Shop</span>
                <span>•</span>
                <span>Support</span>
                <span>•</span>
                <span>Grow</span>
                <span className="w-8 h-px bg-gray-700" />
              </div>
            </div>
  
            {/* =====================================================
                RIGHT SIDE - LOGIN
            ====================================================== */}
            <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
  
              {/* Heading */}
              <div className="mb-4">
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white">
                  Welcome Back
                  <span className="ml-2">👋</span>
                </h1>
  
                <p className="mt-3 text-gray-400 text-base leading-relaxed">
                  Log in to continue exploring unique products
                  <br className="hidden sm:block" />
                  and support independent creators.
                </p>
              </div>
  
              {/* =================================================
                  LOGIN CARD
              ================================================== */}
              <div
                className="
                  relative
                  rounded-3xl
                  border border-purple-500/30
                  bg-[#0B1326]/80
                  backdrop-blur-xl
                  p-7 sm:p-8
                  shadow-[0_20px_60px_rgba(0,0,0,0.35)]
                "
              >
  
                {/* Subtle card glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/[0.04] via-transparent to-pink-500/[0.03] pointer-events-none" />
  
                <div className="relative">
  
                  {/* Error Message */}
                  {errorMessage && (
                    <div
                      className="
                        mb-6
                        px-4 py-3
                        rounded-xl
                        bg-red-500/10
                        border border-red-500/30
                        text-red-400
                        text-sm
                        font-medium
                        text-center
                      "
                    >
                      {errorMessage}
                    </div>
                  )}
  
                  <form onSubmit={loginUser} className="space-y-5">
  
                    {/* Username */}
                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-200 mb-2"
                      >
                        Username
                      </label>
  
                      <div className="relative">
                        <input
                          id="username"
                          type="text"
                          placeholder="Enter your username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="
                            w-full
                            h-14
                            px-4
                            rounded-xl
                            bg-[#111A30]
                            border border-gray-700/80
                            text-white
                            placeholder:text-gray-500
                            outline-none
                            transition-all
                            duration-200
                            focus:border-purple-500
                            focus:ring-2
                            focus:ring-purple-500/20
                            hover:border-gray-600
                          "
                        />
                      </div>
                    </div>
  
                    {/* Password */}
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-200 mb-2"
                      >
                        Password
                      </label>
  
                      <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="
                          w-full
                          h-14
                          px-4
                          rounded-xl
                          bg-[#111A30]
                          border border-gray-700/80
                          text-white
                          placeholder:text-gray-500
                          outline-none
                          transition-all
                          duration-200
                          focus:border-purple-500
                          focus:ring-2
                          focus:ring-purple-500/20
                          hover:border-gray-600
                        "
                      />
                    </div>
  
                    {/* Login Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="
                        w-full
                        h-14
                        mt-2
                        rounded-xl
                        bg-gradient-to-r
                        from-purple-600
                        via-purple-500
                        to-pink-500
                        text-white
                        font-semibold
                        text-base
                        shadow-lg
                        shadow-purple-900/30
                        transition-all
                        duration-200
                        hover:from-purple-500
                        hover:via-purple-500
                        hover:to-pink-400
                        hover:shadow-purple-500/20
                        hover:scale-[1.01]
                        active:scale-[0.99]
                        disabled:opacity-60
                        disabled:cursor-not-allowed
                        disabled:hover:scale-100
                      "
                    >
                      {loading ? "Signing In..." : "Sign In"}
                    </button>
                  </form>
  
                  {/* Divider */}
                  <div className="flex items-center gap-4 my-7">
                    <div className="flex-1 h-px bg-gray-700/70" />
  
                    <span className="text-xs text-gray-500 uppercase">
                      Or
                    </span>
  
                    <div className="flex-1 h-px bg-gray-700/70" />
                  </div>
  
                  {/* Sign Up */}
                  <p className="text-center text-sm text-gray-400">
                    Don&apos;t have an account?
  
                    <Link
                      href="/register"
                      className="
                        ml-2
                        font-semibold
                        text-purple-400
                        hover:text-pink-400
                        transition-colors
                      "
                    >
                      Sign Up
                    </Link>
                  </p>
  
                </div>
              </div>
  
  
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
