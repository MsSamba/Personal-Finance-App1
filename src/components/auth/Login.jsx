"use client"

import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { Link } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"

export function Login({ onToggleMode }) {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const { login, loading, error, clearError } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) return
    try {
      await login(formData)
    } catch (err) {
      console.error("Login failed:", err.message)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Welcome Message */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6">
              Welcome Back to
              <span className="block text-yellow-300">FinanceFlow</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Your personal financial journey continues here. Track, manage, and grow your wealth with confidence.
            </p>
            <div className="space-y-4">
              <Feature icon="✓" bg="bg-green-400" text="Smart Budget Tracking" />
              <Feature icon="💰" bg="bg-yellow-400" text="Savings Goals Made Easy" />
              <Feature icon="📊" bg="bg-pink-400" text="Expense Insights & Analytics" />
            </div>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 right-32 w-20 h-20 bg-yellow-300/20 rounded-full"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-pink-300/15 rounded-full"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">FinanceFlow</h1>
            <p className="text-gray-600">Your money, your future, your control</p>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
            <p className="mt-2 text-gray-600">Ready to take control of your finances? Let's continue your journey.</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-center space-x-3">
                <span className="text-red-500">⚠️</span>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 text-gray-400 h-5 w-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 text-gray-400 h-5 w-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500 font-medium">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In to Your Account"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={onToggleMode}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors duration-200"
                disabled={loading}
              >
                Don&apos;t have an account?{" "}
                <span className="underline decoration-2 underline-offset-2">Create one now</span>
              </button>
            </div>
          </form>

          {/* Trust Indicators */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
              <Indicator icon="🔐" text="Secure Login" />
              <Indicator icon="🛡️" text="Privacy Protected" />
              <Indicator icon="⚡" text="Lightning Fast" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Feature({ icon, bg, text }) {
  return (
    <div className="flex items-center space-x-3">
      <div className={`w-8 h-8 ${bg} rounded-full flex items-center justify-center`}>
        <span className="font-bold">{icon}</span>
      </div>
      <span className="text-lg">{text}</span>
    </div>
  )
}

function Indicator({ icon, text }) {
  return (
    <div className="flex items-center">
      <span className="mr-1">{icon}</span>
      <span>{text}</span>
    </div>
  )
}
