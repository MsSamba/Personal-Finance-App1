"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { ArrowRightOnRectangleIcon, CogIcon } from "@heroicons/react/24/outline"

export function UserProfile() {
  const { currentUser, userProfile, logout, loading } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(".user-profile-dropdown")) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDropdown])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const getInitials = () => {
    if (currentUser?.first_name && currentUser?.last_name) {
      return `${currentUser.first_name.charAt(0)}${currentUser.last_name.charAt(0)}`
    }
    return currentUser?.email?.charAt(0)?.toUpperCase() || "U"
  }

  const getDisplayName = () => {
    if (currentUser?.first_name && currentUser?.last_name) {
      return `${currentUser.first_name} ${currentUser.last_name}`
    }
    return currentUser?.username || "User"
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 p-2">
        <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="hidden lg:block">
          <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative user-profile-dropdown">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors w-full"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          {userProfile?.avatar ? (
            <img
              src={userProfile.avatar || "/placeholder.svg"}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-white text-sm font-medium">{getInitials()}</span>
          )}
        </div>
        <div className="text-left hidden lg:block flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{getDisplayName()}</p>
          <p className="text-xs text-gray-300 truncate">{currentUser?.email}</p>
        </div>
        <div className="hidden lg:block">
          <svg
            className={`w-4 h-4 text-gray-300 transition-transform ${showDropdown ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {showDropdown && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border py-2 z-50">
          <div className="px-4 py-3 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                {userProfile?.avatar ? (
                  <img
                    src={userProfile.avatar || "/placeholder.svg"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-medium">{getInitials()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{getDisplayName()}</p>
                <p className="text-sm text-gray-500 truncate">{currentUser?.email}</p>
                {currentUser?.is_verified ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    ✓ Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⚠ Unverified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                setShowProfileModal(true)
                setShowDropdown(false)
              }}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <CogIcon className="w-4 h-4" />
              <span>Profile Settings</span>
            </button>
          </div>

          <div className="border-t py-1">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </div>
  )
}

function ProfileModal({ onClose }) {
  const {
    currentUser,
    userProfile,
    updateProfile,
    updateUser,
    changePassword,
    resendVerificationEmail,
    loading,
    error,
  } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [profileData, setProfileData] = useState({
    phone_number: userProfile?.phone_number || "",
    preferred_currency: userProfile?.preferred_currency || "KES",
    theme_preference: userProfile?.theme_preference || "light",
    email_notifications: userProfile?.email_notifications ?? true,
    sms_notifications: userProfile?.sms_notifications ?? false,
    budget_alerts: userProfile?.budget_alerts ?? true,
    bill_reminders: userProfile?.bill_reminders ?? true,
    monthly_budget_limit: userProfile?.monthly_budget_limit || "",
    savings_goal_percentage: userProfile?.savings_goal_percentage || 20,
  })
  const [userData, setUserData] = useState({
    first_name: currentUser?.first_name || "",
    last_name: currentUser?.last_name || "",
  })
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    new_password_confirm: "",
  })
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("") // 'success' or 'error'

  const showMessage = (msg, type) => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => {
      setMessage("")
      setMessageType("")
    }, 5000)
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(profileData)
      showMessage("Profile updated successfully!", "success")
    } catch (error) {
      showMessage(error.message, "error")
    }
  }

  const handleUserUpdate = async (e) => {
    e.preventDefault()
    try {
      await updateUser(userData)
      showMessage("Personal information updated successfully!", "success")
    } catch (error) {
      showMessage(error.message, "error")
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (passwordData.new_password !== passwordData.new_password_confirm) {
      showMessage("New passwords do not match", "error")
      return
    }

    try {
      await changePassword(passwordData)
      setPasswordData({
        old_password: "",
        new_password: "",
        new_password_confirm: "",
      })
      showMessage("Password changed successfully!", "success")
    } catch (error) {
      showMessage(error.message, "error")
    }
  }

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail()
      showMessage("Verification email sent!", "success")
    } catch (error) {
      showMessage(error.message, "error")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {message && (
          <div
            className={`mx-6 mt-4 p-3 rounded-md ${
              messageType === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "profile" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("personal")}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "personal"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "security"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Security
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "profile" && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone_number}
                    onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+254712345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Currency</label>
                  <select
                    value={profileData.preferred_currency}
                    onChange={(e) => setProfileData({ ...profileData, preferred_currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="KES">Kenyan Shilling (KES)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme Preference</label>
                  <select
                    value={profileData.theme_preference}
                    onChange={(e) => setProfileData({ ...profileData, theme_preference: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget Limit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={profileData.monthly_budget_limit}
                    onChange={(e) => setProfileData({ ...profileData, monthly_budget_limit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50000.00"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Savings Goal Percentage: {profileData.savings_goal_percentage}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={profileData.savings_goal_percentage}
                    onChange={(e) =>
                      setProfileData({ ...profileData, savings_goal_percentage: Number.parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileData.email_notifications}
                      onChange={(e) => setProfileData({ ...profileData, email_notifications: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Email notifications</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileData.sms_notifications}
                      onChange={(e) => setProfileData({ ...profileData, sms_notifications: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">SMS notifications</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileData.budget_alerts}
                      onChange={(e) => setProfileData({ ...profileData, budget_alerts: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Budget alerts</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileData.bill_reminders}
                      onChange={(e) => setProfileData({ ...profileData, bill_reminders: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Bill reminders</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          )}

          {activeTab === "personal" && (
            <div className="space-y-6">
              <form onSubmit={handleUserUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={userData.first_name}
                      onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={userData.last_name}
                      onChange={(e) => setUserData({ ...userData, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Updating..." : "Update Personal Info"}
                </button>
              </form>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium">{currentUser?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Username:</span>
                    <span className="text-sm font-medium">{currentUser?.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Member since:</span>
                    <span className="text-sm font-medium">
                      {new Date(currentUser?.date_joined).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Email verified:</span>
                    <div className="flex items-center space-x-2">
                      {currentUser?.is_verified ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Verified
                        </span>
                      ) : (
                        <>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ✗ Not verified
                          </span>
                          <button
                            onClick={handleResendVerification}
                            disabled={loading}
                            className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          >
                            Resend
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Change Password</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.new_password_confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password_confirm: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  !passwordData.old_password ||
                  !passwordData.new_password ||
                  !passwordData.new_password_confirm
                }
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Changing Password..." : "Change Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
