"use client";

import {
  Mail,
  Calendar,
  User,
  Pencil,
  Heart,
  MessageCircle,
  Users,
  Crown,
} from "lucide-react";

export default function ProfileOverview({ user, openEdit }) {
  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        {/* Cover */}
        <div
          className="relative h-45 rounded-t-1xl overflow-hidden bg-center bg-cover z-0"
          style={{
            backgroundImage: "url('/images/insta_banner.png')",
          }}
        >
          <button
            onClick={openEdit}
            className="absolute top-5 right-5 bg-white text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-xl flex items-center gap-2 shadow-md transition"
          >
            <Pencil size={18} />
            Edit Profile
          </button>
        </div>

        {/* Profile */}
        <div className="px-8 pb-8">
          <div className="-mt-10 flex flex-col md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-6 relative z-20">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-purple-600 to-pink-500 shadow-xl flex items-center justify-center">
                <span className="text-5xl font-bold text-white">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>

              <div className="pb-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                </div>

                <p className="font-semibold text-lg mb-2">{user.username}</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-8">
            <h2 className="font-semibold text-lg mb-2">Bio</h2>

            <p className="text-gray-600 leading-7">{user.bio}</p>
          </div>

          {/* Information */}
          <div className="grid md:grid-cols-3 gap-5 mt-8">
            <div className="bg-gray-50 rounded-2xl p-5">
              <div className="flex items-center gap-3 text-purple-600 mb-3">
                <Mail />
                <h3 className="font-semibold">Email</h3>
              </div>

              <p className="text-gray-700 break-all">{user.email}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5">
              <div className="flex items-center gap-3 text-pink-600 mb-3">
                <User />
                <h3 className="font-semibold">Username</h3>
              </div>

              <p className="text-gray-700">{user.username}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5">
              <div className="flex items-center gap-3 text-orange-600 mb-3">
                <Calendar />
                <h3 className="font-semibold">Joined</h3>
              </div>

              <p className="text-gray-700">{user.joined}</p>
            </div>
          </div>
        </div>
      </div>


      {/* About */}
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-5">About InstaBazaar Profile</h2>

        <p className="text-gray-600 leading-8">
          Your profile is your personal identity on InstaBazaar. Keep your
          information updated so vendors and the community can recognize you
          easily. You can save products, write reviews, follow your favorite
          vendors, and customize your account settings from here.
        </p>
      </div>
    </div>
  );
}
