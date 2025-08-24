"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { authAPI } from "../config/api"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("access_token")
        const userData = localStorage.getItem("user_data")

        if (token && userData) {
          const user = JSON.parse(userData)
          setCurrentUser(user)

          // Fetch fresh user data and profile
          await fetchUserData()
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        clearAuthData()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Fetch current user data and profile
  const fetchUserData = useCallback(async () => {
    try {
      const [userResponse, profileResponse] = await Promise.all([authAPI.getUser(), authAPI.getProfile()])

      setCurrentUser(userResponse.data)
      setUserProfile(profileResponse.data)

      // Update localStorage with fresh data
      localStorage.setItem("user_data", JSON.stringify(userResponse.data))

      return { user: userResponse.data, profile: profileResponse.data }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      throw error
    }
  }, [])

  // Clear authentication data
  const clearAuthData = useCallback(() => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user_data")
    setCurrentUser(null)
    setUserProfile(null)
    setError(null)
  }, [])

  // Register new user
  const register = useCallback(
    async (userData) => {
      try {
        setLoading(true)
        setError(null)

        const response = await authAPI.register(userData)
        const { user, tokens } = response.data

        // Store tokens and user data
        localStorage.setItem("access_token", tokens.access)
        localStorage.setItem("refresh_token", tokens.refresh)
        localStorage.setItem("user_data", JSON.stringify(user))

        setCurrentUser(user)

        // Fetch profile data
        await fetchUserData()

        return response.data
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.email?.[0] ||
          error.response?.data?.username?.[0] ||
          "Registration failed. Please try again."
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [fetchUserData],
  )

  // Login user
  const login = useCallback(
    async (credentials) => {
      try {
        setLoading(true)
        setError(null)
        localStorage.clear()
        setCurrentUser(null)
        setUserProfile(null)

        // Authenticate
        const response = await authAPI.login(credentials)
        const { user, tokens } = response.data
        

        // Store tokens and user data
        localStorage.setItem("access_token", tokens.access)
        localStorage.setItem("refresh_token", tokens.refresh)
        localStorage.setItem("user_data", JSON.stringify(user))

        setCurrentUser(user)

        // Fetch profile data
        await fetchUserData()

        return response.data
      } catch (error) {
        const errorMessage =
          error.response?.data?.non_field_errors?.[0] ||
          error.response?.data?.message ||
          "Login failed. Please check your credentials."
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [fetchUserData],
  )

  // Logout user
  const logout = useCallback(async () => {
    try {
      localStorage.removeItem("access_token")
      localStorage.removeItem("user_data")
      const refreshToken = localStorage.getItem("refresh_token")
      if (refreshToken) {
        await authAPI.logout(refreshToken)
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      clearAuthData()
    }
  }, [clearAuthData])

  // Update user profile
  const updateProfile = useCallback(async (profileData) => {
    try {
      setError(null)
      const response = await authAPI.updateProfile(profileData)
      setUserProfile(response.data)
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Profile update failed"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Update user information
  const updateUser = useCallback(async (userData) => {
    try {
      setError(null)
      const response = await authAPI.updateUser(userData)
      setCurrentUser(response.data)
      localStorage.setItem("user_data", JSON.stringify(response.data))
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || "User update failed"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Change password
  const changePassword = useCallback(async (passwordData) => {
    try {
      setError(null)
      const response = await authAPI.changePassword(passwordData)
      return response.data
    } catch (error) {
      const errorMessage =
        error.response?.data?.old_password?.[0] ||
        error.response?.data?.new_password?.[0] ||
        error.response?.data?.message ||
        "Password change failed"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Request password reset
  const requestPasswordReset = useCallback(async (email) => {
    try {
      setError(null)
      const response = await authAPI.resetPassword(email)
      return response.data
    } catch (error) {
      const errorMessage =
        error.response?.data?.email?.[0] || error.response?.data?.message || "Password reset request failed"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Confirm password reset
  const confirmPasswordReset = useCallback(async (tokenData) => {
    try {
      setError(null)
      const response = await authAPI.confirmPasswordReset(tokenData)
      return response.data
    } catch (error) {
      const errorMessage =
        error.response?.data?.non_field_errors?.[0] || error.response?.data?.message || "Password reset failed"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Verify email
  const verifyEmail = useCallback(
    async (token) => {
      try {
        setError(null)
        const response = await authAPI.verifyEmail(token)

        // Refresh user data to get updated verification status
        await fetchUserData()

        return response.data
      } catch (error) {
        const errorMessage =
          error.response?.data?.token?.[0] || error.response?.data?.message || "Email verification failed"
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [fetchUserData],
  )

  // Resend verification email
  const resendVerificationEmail = useCallback(async () => {
    try {
      setError(null)
      const response = await authAPI.resendVerification()
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to resend verification email"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value = {
    // State
    currentUser,
    userProfile,
    loading,
    error,

    // Auth methods
    register,
    login,
    logout,

    // User management
    updateProfile,
    updateUser,
    fetchUserData,

    // Password management
    changePassword,
    requestPasswordReset,
    confirmPasswordReset,

    // Email verification
    verifyEmail,
    resendVerificationEmail,

    // Utility
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
