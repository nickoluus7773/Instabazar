"use client";

import {
  User,
  Heart,
  MessageCircle,
  Settings,
  LogOut,
  Crown,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ProfileSidebar({ user, activeTab, setActiveTab }) {
  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: User,
    },
    
    {
      id: "reviews",
      label: "My Reviews",
      icon: MessageCircle,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];
  const { isLoggedIn, logout } = useAuth();

  return (
    <div className="sticky top-8">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-r from-[#17113A] via-[#4F46E5] to-[#7C3AED]" />

        {/* Profile */}

        <div className="px-6 pb-6">
          <div className="flex justify-center -mt-14">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-[#4F46E5] to-[#EC4899] shadow-xl flex items-center justify-center">
              <span className="text-5xl font-bold text-white">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          </div>

          <div className="text-center mt-4">
          <h2 className="text-xl font-bold text-[#0F172A]"></h2>

          <p className="text-[#64748B] text-sm">{user.username}</p>
          </div>



          {/* Navigation */}

          <div className="mt-8 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === item.id
  ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-lg"
  : "hover:bg-[#F8FAFC] text-[#475569]"
                  }`}
                >
                  <Icon size={20} />

                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Logout */}

          <button
          className="w-full mt-8 flex justify-center items-center gap-3 bg-[#EF4444] hover:bg-[#DC2626] transition-all text-white rounded-xl py-3 font-semibold shadow-sm"
            onClick={logout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
