"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"

export function VerificationBanner() {
  const { currentUser, resendVerificationEmail, loading } = useAuth()
  const [isHidden, setIsHidden] = useState(false)
  const [message, setMessage] = useState("")

  if (!currentUser || currentUser.is_verified || isHidden) {
    return null
  }

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail()
      setMessage("Verification email sent! Please check your inbox.")
      setTimeout(() => setMessage(""), 5000)
    } catch (error) {
      setMessage("Failed to send verification email. Please try again.")
      setTimeout(() => setMessage(""), 5000)
    }
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">Email Verification Required</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>Please verify your email address to access all features. Check your inbox for a verification link.</p>
            {message && <p className="mt-2 font-medium">{message}</p>}
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleResendVerification}
              disabled={loading}
              className="bg-yellow-100 px-3 py-2 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-200 disabled:opacity-50 transition-colors"
            >
              {loading ? "Sending..." : "Resend Verification Email"}
            </button>
            <button
              onClick={() => setIsHidden(true)}
              className="bg-transparent px-3 py-2 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
