"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { UserIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline"

export function UserProfile() {
  const { currentUser, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-white" />
        </div>
        <div className="text-left hidden lg:block">
          <p className="text-sm font-medium text-white">{currentUser?.displayName || "User"}</p>
          <p className="text-xs text-gray-300">{currentUser?.email}</p>
        </div>
      </button>

      {showDropdown && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border py-2 z-50">
          <div className="px-4 py-2 border-b">
            <p className="font-medium text-gray-900">{currentUser?.displayName || "User"}</p>
            <p className="text-sm text-gray-500">{currentUser?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  )
}
