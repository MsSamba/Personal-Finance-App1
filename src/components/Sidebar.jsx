"use client"

import { useState } from "react"
import { NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const navigation = [
  { name: "Overview", href: "/", icon: "🏠" },
  { name: "Transactions", href: "/transactions", icon: "💳" },
  { name: "Budgets", href: "/budgets", icon: "📊" },
  { name: "Pots", href: "/pots", icon: "🏺" },
  { name: "Recurring Bills", href: "/recurring-bills", icon: "🔄" },
]

export function Sidebar({ isOpen, onClose }) {
  const { currentUser, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const getInitials = () => {
    const firstName = currentUser?.first_name?.trim()
    const lastName = currentUser?.last_name?.trim()
    const displayName = currentUser?.displayName?.trim()
    const username = currentUser?.username?.trim()
    const email = currentUser?.email?.trim()

    let initials = ""

    // Try to get initials from first and last name
    if (firstName && lastName) {
      initials = `${firstName.charAt(0)}${lastName.charAt(0)}`
    }
    // If only first name exists
    else if (firstName) {
      initials = firstName.charAt(0)
    }
    // If only last name exists
    else if (lastName) {
      initials = lastName.charAt(0)
    }
    // Try displayName if available
    else if (displayName) {
      initials = displayName.charAt(0)
    }
    // Fallback to username
    else if (username) {
      initials = username.charAt(0)
    }
    // Fallback to email
    else if (email) {
      initials = email.charAt(0)
    }
    // Final fallback
    else {
      initials = "U"
    }

    // Always uppercase
    return initials.toUpperCase()
  }

  const getDisplayName = () => {
    const firstName = currentUser?.first_name?.trim()
    const lastName = currentUser?.last_name?.trim()
    const displayName = currentUser?.displayName?.trim()
    const username = currentUser?.username?.trim()

    // Try full name first
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    }
    // If only first name exists
    else if (firstName) {
      return firstName
    }
    // If only last name exists
    else if (lastName) {
      return lastName
    }
    // Try displayName if available
    else if (displayName) {
      return displayName
    }
    // Fallback to username or default
    else if (username) {
      return username
    } else {
      return "User"
    }
  }

  const getDisplayUsername = () => {
    const username = currentUser?.username?.trim()
    const email = currentUser?.email?.trim()

    if (username) {
      return `@${username}`
    } else if (email) {
      return email
    } else {
      return "username"
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 bg-gray-900 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "w-16" : "w-64"}
      `}
      >
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} h-16 px-6 bg-gray-800`}
        >
          {!isCollapsed && <h1 className="text-xl font-bold text-white">Finance</h1>}

          {/* Desktop collapse toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:block p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? "→" : "←"}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
          >
            ✕
          </button>
        </div>

        <nav className="mt-8 px-4 flex-1">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    } ${isCollapsed ? "justify-center" : ""}`
                  }
                  onClick={() => onClose()}
                  title={isCollapsed ? item.name : ""}
                >
                  <span className={`text-lg ${isCollapsed ? "" : "mr-3"}`}>{item.icon}</span>
                  {!isCollapsed && item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile at bottom */}
        <div className={`p-4 border-t border-gray-700 ${isCollapsed ? "px-2" : ""}`}>
          {isCollapsed ? (
            <div>
              <div className="flex items-center justify-center mb-2" title={getDisplayName()}>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer">
                  <span className="text-white text-sm font-medium">{getInitials()}</span>
                </div>
              </div>

              {/* Collapsed sign out button */}
              <button
                onClick={logout}
                className="w-full bg-red-600 text-white p-2 rounded-lg text-xs hover:bg-red-700 transition-colors flex items-center justify-center"
                title="Sign Out"
              >
                🚪
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{getInitials()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{getDisplayName()}</p>
                  <p className="text-xs text-gray-300 truncate">{getDisplayUsername()}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
