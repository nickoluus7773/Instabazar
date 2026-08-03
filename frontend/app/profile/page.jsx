"use client";

import ProfileSidebar from "./profile-cmp/ProfileSidebar";
import ProfileOverview from "./profile-cmp/ProfileOverview";
import Favorites from "./profile-cmp/Favorites";
import MyReviews from "./profile-cmp/MyReviews";
import Settings from "./profile-cmp/Settings";
import EditProfileModal from "./profile-cmp/EditProfileModal";
import Navbar from "../components/layout/Navbar";
import axios from "axios";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [user, setUser] = useState(null);
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <ProfileOverview user={user} openEdit={() => setIsEditOpen(true)} />
        );

      case "favorites":
        return <Favorites />;

      case "reviews":
        return <MyReviews />;

      case "settings":
        return <Settings user={user} />;

      default:
        return (
          <ProfileOverview user={user} openEdit={() => setIsEditOpen(true)} />
        );
    }
  };
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get("http://127.0.0.1:8000/api/profile/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-5 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}

            <div className="lg:col-span-1">
              <ProfileSidebar
                user={user}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>

            {/* Right Content */}

            <div className="lg:col-span-3">{renderContent()}</div>
          </div>
        </div>

        {isEditOpen && (
          <EditProfileModal
            user={user}
            setUser={setUser}
            closeModal={() => setIsEditOpen(false)}
          />
        )}
      </div>
    </>
  );
}
