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
      id: "favorites",
      label: "Favorites",
      icon: Heart,
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
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        {/* Cover */}

        <div className="h-28 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400" />

        {/* Profile */}

        <div className="px-6 pb-6">
          <div className="flex justify-center -mt-14">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-purple-600 to-pink-500 shadow-xl flex items-center justify-center">
              <span className="text-5xl font-bold text-white">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          </div>

          <div className="text-center mt-4">
            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>

            <p className="text-gray-500 text-sm">{user.username}</p>
          </div>

          {/* Stats */}

          <div className="grid grid-cols-3 gap-3 mt-8">
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <Heart className="mx-auto text-purple-600 mb-2" size={20} />

              <h3 className="font-bold text-lg">{user.favorites}</h3>

              <p className="text-xs text-gray-500">Favorites</p>
            </div>

            <div className="bg-pink-50 rounded-xl p-3 text-center">
              <MessageCircle className="mx-auto text-pink-600 mb-2" size={20} />

              <h3 className="font-bold text-lg">{user.reviews}</h3>

              <p className="text-xs text-gray-500">Reviews</p>
            </div>

            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <Users className="mx-auto text-orange-600 mb-2" size={20} />

              <h3 className="font-bold text-lg">{user.following}</h3>

              <p className="text-xs text-gray-500">Following</p>
            </div>
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
                      ? "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white shadow-lg"
                      : "hover:bg-gray-100 text-gray-700"
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
            className="w-full mt-8 flex justify-center items-center gap-3 bg-red-500 hover:bg-red-600 transition-all text-white rounded-xl py-3 font-semibold"
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
