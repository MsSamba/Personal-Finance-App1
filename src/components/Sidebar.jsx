"use client"

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
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
          <h1 className="text-xl font-bold text-white">My Finance App</h1>
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
                    }`
                  }
                  onClick={() => onClose()}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile at bottom */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser?.displayName || "User"}</p>
              <p className="text-xs text-gray-300 truncate">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  )
}
