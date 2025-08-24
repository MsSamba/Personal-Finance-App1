"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useSearchParams, useNavigate } from "react-router-dom"

export function EmailVerification() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")

  const [verificationStatus, setVerificationStatus] = useState("verifying") // 'verifying', 'success', 'error'
  const [message, setMessage] = useState("")

  const { verifyEmail, resendVerificationEmail, currentUser, loading, error } = useAuth()

  useEffect(() => {
    if (token) {
      handleVerification()
    } else {
      setVerificationStatus("error")
      setMessage("Invalid verification link")
    }
  }, [token])

  const handleVerification = async () => {
    try {
      const response = await verifyEmail(token)
      setVerificationStatus("success")
      setMessage(response.message || "Email verified successfully!")
    } catch (error) {
      setVerificationStatus("error")
      setMessage(error.message || "Email verification failed")
    }
  }

  const handleResendVerification = async () => {
    try {
      const response = await resendVerificationEmail()
      setMessage(response.message || "Verification email sent!")
    } catch (error) {
      setMessage(error.message || "Failed to resend verification email")
    }
  }

  const renderContent = () => {
    switch (verificationStatus) {
      case "verifying":
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </div>
        )

      case "success":
        return (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        )

      case "error":
        return (
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Verification Failed</h2>
            <p className="text-red-600 mb-6">{message}</p>

            {currentUser && !currentUser.is_verified && (
              <div className="space-y-4">
                <button
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Sending..." : "Resend Verification Email"}
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Continue to Dashboard
                </button>
              </div>
            )}

            {!currentUser && (
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">{renderContent()}</div>
    </div>
  )
}
