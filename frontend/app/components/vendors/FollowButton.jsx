"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { followVendor, unfollowVendor } from "@/lib/followApi";

export default function FollowButton({ vendor }) {
  const { isLoggedIn, isVendor, roleResolved } = useAuth();
  const [following, setFollowing] = useState(Boolean(vendor?.is_following));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!isLoggedIn || !roleResolved || isVendor || !vendor?.follow_eligible) return null;

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const token = localStorage.getItem("accessToken");
      if (following) await unfollowVendor(token, vendor.id);
      else await followVendor(token, vendor.id);
      setFollowing(!following);
    } catch (cause) {
      setError(cause.message || "Could not update follow status.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-28">
      <button type="button" onClick={toggle} disabled={busy} aria-pressed={following}
        className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl border px-4 text-sm font-bold transition disabled:cursor-wait disabled:opacity-60 ${following ? "border-fuchsia-200 bg-white text-fuchsia-700 hover:bg-fuchsia-50" : "border-fuchsia-600 bg-fuchsia-600 text-white shadow-sm hover:border-fuchsia-700 hover:bg-fuchsia-700"}`}>
        {busy ? "Saving..." : following ? "Following" : "Follow"}
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
