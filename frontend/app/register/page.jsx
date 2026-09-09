"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    <div className="min-h-screen bg-[#081225] text-white relative overflow-hidden">
  
      {/* ================= BACKGROUND DECORATION ================= */}
  
      {/* Top-right purple glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-purple-700/20 blur-3xl pointer-events-none" />
  
      {/* Bottom-left purple glow */}
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-700/20 blur-3xl pointer-events-none" />
  
      {/* Bottom-right pink glow */}
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-pink-600/10 blur-3xl pointer-events-none" />
  
      {/* ================= NAVBAR ================= */}
  
      <Navbar/>
  
      {/* ================= MAIN CONTENT ================= */}
  
      <div className="relative z-10 min-h-[calc(100vh-64px)] flex items-center">
  
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 py-5">
  
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">
  
            {/* =====================================================
                LEFT SIDE — MARKETPLACE ILLUSTRATION
            ====================================================== */}
  
            <div className="hidden lg:flex flex-col items-center justify-center">
  
              <div className="relative w-full max-w-[460px]">
  
                {/* Purple circle behind shop */}
                <div
                  className="
                    absolute
                    w-[390px]
                    h-[390px]
                    rounded-full
                    bg-purple-700/25
                    blur-[1px]
                    top-1/2
                    left-1/2
                    -translate-x-1/2
                    -translate-y-1/2
                  "
                />
  
                {/* Illustration */}
                <img
                  src="/images/signimg.png"
                  alt="InstaBazaar marketplace"
                  className="
                    relative
                    z-10
                    w-full
                    h-auto
                    object-contain
                    drop-shadow-[0_0_35px_rgba(124,58,237,0.25)]
                  "
                />
              </div>
  
              {/* Tagline */}
              <div className="mt-1 text-center">
  
                <p className="text-[11px] tracking-[0.4em] uppercase text-gray-500">
                  A Marketplace For Real People
                </p>
  
                <div className="w-14 h-[2px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mt-4" />
  
              </div>
              <div className="flex items-center justify-center gap-3 mt-6 text-[10px] text-gray-600">
  
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
                RIGHT SIDE — SIGN UP CARD
            ====================================================== */}
  
            <div className="w-full max-w-[500px] mx-auto lg:mx-0 lg:ml-auto">
  
              <div
                className="
                  relative
                  rounded-[24px]
                  border
                  border-purple-500/40
                  bg-[#0B1427]/90
                  backdrop-blur-xl
                  px-7
                  sm:px-8
                  py-8
                  shadow-[0_25px_70px_rgba(0,0,0,0.45)]
                "
              >
  
                {/* Subtle card glow */}
                <div
                  className="
                    absolute
                    inset-0
                    rounded-[24px]
                    bg-gradient-to-br
                    from-purple-500/[0.06]
                    via-transparent
                    to-pink-500/[0.04]
                    pointer-events-none
                  "
                />
  
                <div className="relative">
  
                  {/* Heading */}
  
                  <h1 className="text-center text-3xl font-bold text-white ">
                    Create Account
                  </h1>
  
                  <p className="text-center text-sm text-gray-400 mt-2 mb-4">
                    Join InstaBazaar and start your marketplace journey
                  </p>
  
                  {/* ================= FORM ================= */}
  
                  <form onSubmit={registerUser} className="space-y-4">
  
                    {/* Username */}
  
                    <div>
                      <label className="block text-xs font-semibold text-gray-200 mb-2">
                        Username
                      </label>
  
                      <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="
                          w-full
                          h-11
                          px-4
                          rounded-xl
                          bg-[#111B30]
                          border
                          border-gray-700
                          text-white
                          text-sm
                          placeholder:text-gray-500
                          outline-none
                          transition-all
                          focus:border-purple-500
                          focus:ring-2
                          focus:ring-purple-500/20
                        "
                        required
                      />
                    </div>
  
                    {/* Email */}
  
                    <div>
                      <label className="block text-xs font-semibold text-gray-200 mb-2">
                        Email
                      </label>
  
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="
                          w-full
                          h-11
                          px-4
                          rounded-xl
                          bg-[#111B30]
                          border
                          border-gray-700
                          text-white
                          text-sm
                          placeholder:text-gray-500
                          outline-none
                          transition-all
                          focus:border-purple-500
                          focus:ring-2
                          focus:ring-purple-500/20
                        "
                        required
                      />
                    </div>
  
                    {/* Password */}
  
                    <div>
                      <label className="block text-xs font-semibold text-gray-200 mb-2">
                        Password
                      </label>
  
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="
                          w-full
                          h-11
                          px-4
                          rounded-xl
                          bg-[#111B30]
                          border
                          border-gray-700
                          text-white
                          text-sm
                          placeholder:text-gray-500
                          outline-none
                          transition-all
                          focus:border-purple-500
                          focus:ring-2
                          focus:ring-purple-500/20
                        "
                        required
                      />
                    </div>
  
                    {/* Confirm Password */}
  
                    <div>
                      <label className="block text-xs font-semibold text-gray-200 mb-2">
                        Confirm Password
                      </label>
  
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="
                          w-full
                          h-11
                          px-4
                          rounded-xl
                          bg-[#111B30]
                          border
                          border-gray-700
                          text-white
                          text-sm
                          placeholder:text-gray-500
                          outline-none
                          transition-all
                          focus:border-purple-500
                          focus:ring-2
                          focus:ring-purple-500/20
                        "
                        required
                      />
                    </div>
  
                    {/* ================= CREATE ACCOUNT ================= */}
  
                    <button
                      type="submit"
                      disabled={loading}
                      className="
                        w-full
                        h-11
                        mt-2
                        rounded-xl
                        text-white
                        text-sm
                        font-bold
                        bg-gradient-to-r
                        from-purple-600
                        via-fuchsia-500
                        to-pink-500
                        shadow-lg
                        shadow-purple-900/30
                        transition-all
                        duration-200
                        hover:scale-[1.01]
                        hover:shadow-purple-500/20
                        active:scale-[0.99]
                        disabled:opacity-60
                        disabled:cursor-not-allowed
                      "
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </button>
  
                    {/* ================= VENDOR ================= */}
  
                    <Link
                      href="/register/vendor"
                      className="
                        flex
                        items-center
                        justify-center
                        w-full
                        h-11
                        rounded-xl
                        border
                        border-purple-500/70
                        text-purple-400
                        text-sm
                        font-semibold
                        hover:bg-purple-500/10
                        hover:border-purple-400
                        transition-all
                      "
                    >
                      Sign up as Vendor
                    </Link>
  
                  </form>
  
                  {/* ================= SIGN IN ================= */}
  
                  <p className="text-center text-xs text-gray-400 mt-5">
  
                    Already have an account?
  
                    <Link
                      href="/login"
                      className="
                        text-purple-400
                        font-semibold
                        ml-2
                        hover:text-pink-400
                        transition-colors
                      "
                    >
                      Sign in
                    </Link>
  
                  </p>
  
                </div>
              </div>
  
              {/* Bottom navigation decoration */}
  
  
            </div>
  
          </div>
        </div>
      </div>
    </div>
  );
}
