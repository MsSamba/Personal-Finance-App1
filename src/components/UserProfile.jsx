"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../config/api";

function fmt(val) {
  if (val === null || val === undefined || val === "") return "—";
  return String(val);
}

export default function UserProfile() {
  const { userProfile, changePassword, logout, loading } = useAuth();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [profileData, setProfileData] = useState({
    user_full_name: userProfile?.user_full_name || "",
    user_email: userProfile?.user_email || "",
    phone_number: userProfile?.phone_number || "",
    preferred_currency: userProfile?.preferred_currency || "KES",
  });
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    new_password_confirm: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
  };

 const editProfile = async (e) => {
  e.preventDefault();

  try {
    // Split full name into first and last
    const [first_name, ...rest] = profileData.user_full_name.trim().split(" ");
    const last_name = rest.join(" ") || "";

    // Prepare payload for both user and profile
    const payload = {
      first_name,
      last_name,
      email: profileData.user_email,
      profile: {
        phone_number: profileData.phone_number,
        preferred_currency: profileData.preferred_currency,
      },
    };

    const res = await authAPI.updateProfile(payload);

    showMessage("Profile updated successfully!", "success");
    setIsEditingProfile(false);
    
      window.location.reload();


  } catch (error) {
    console.error("Updating profile failed:", error);
    showMessage("Failed to update profile. Try again.", "error");
  }
};

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.new_password_confirm) {
      showMessage("New passwords do not match.", "error");
      return;
    }
    if (!passwordData.old_password || !passwordData.new_password) {
      showMessage("Please fill all password fields.", "error");
      return;
    }

    try {
      await changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
        new_password_confirm: passwordData. new_password_confirm,
      });

      setPasswordData({
        old_password: "",
        new_password: "",
        new_password_confirm: "",
      });
      setShowPasswordSection(false);
      showMessage("Password changed successfully.", "success");
    } catch (err) {
      const errMsg = err?.message || "Failed to change password.";
      showMessage(errMsg, "error");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
      showMessage("Failed to log out. Try again.", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-40 flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* header */}
        <div className="px-6 py-6 border-b">
          <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            {fmt(userProfile?.user_full_name)}
          </p>
        </div>

        {/* message */}
        {message && (
          <div
            className={`m-4 p-3 rounded-md text-sm ${
              messageType === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* content */}
        <div className="p-6 space-y-6">
          {/* profile info */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-700">Account info</h2>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {isEditingProfile ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={editProfile} className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email</label>
                  <input
  type="email"
  value={profileData.user_email}
  onChange={(e) =>
    setProfileData({ ...profileData, user_email: e.target.value })
  }
  className="w-full px-3 py-2 border border-gray-300 rounded-md"
/>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Full name</label>
                  <input
  type="text"
  value={profileData.user_full_name}
  onChange={(e) =>
    setProfileData({ ...profileData, user_full_name: e.target.value })
  }
  className="w-full px-3 py-2 border border-gray-300 rounded-md"
/>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Phone number</label>
                 <input
  type="tel"
  value={profileData.phone_number}
  onChange={(e) =>
    setProfileData({ ...profileData, phone_number: e.target.value })
  }
  className="w-full px-3 py-2 border border-gray-300 rounded-md"
/>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Preferred currency
                  </label>
                 <input
  type="text"
  value={profileData.preferred_currency}
  onChange={(e) =>
    setProfileData({ ...profileData, preferred_currency: e.target.value })
  }
  className="w-full px-3 py-2 border border-gray-300 rounded-md"
/>
                </div>
                <div className="flex justify-end gap-2 pt-2">
    <button
      type="button"
      onClick={() => setIsEditingProfile(false)}
      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Save Changes
    </button>
  </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="font-medium">{fmt(userProfile?.user_email)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Full name</div>
                  <div className="font-medium">{fmt(userProfile?.user_full_name)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Phone number</div>
                  <div className="font-medium">{fmt(userProfile?.phone_number)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Preferred currency</div>
                  <div className="font-medium">
                    {fmt(userProfile?.preferred_currency)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* change password */}
          <div>
            {!showPasswordSection ? (
              <button
                onClick={() => setShowPasswordSection(true)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Change Password
              </button>
            ) : (
              <div>
                <h2 className="text-sm font-medium text-gray-700 mb-3">
                  Change password
                </h2>
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Current password
                    </label>
                    <input
                      type="password"
                      value={passwordData.old_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          old_password: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      New password
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          new_password: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password_confirm}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          new_password_confirm: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordSection(false);
                        setPasswordData({
                          old_password: "",
                          new_password: "",
                          new_password_confirm: "",
                        });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* sign out */}
          <div className="pt-4 border-t">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 w-full"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}