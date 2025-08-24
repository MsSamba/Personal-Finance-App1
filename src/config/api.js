// api.js
import axios from "axios"

// ✅ Use Vite env vars instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
})

// Request interceptor → add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor → refresh token if expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refresh_token")
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/token/refresh/`,
            { refresh: refreshToken }
          )

          const { access } = response.data
          localStorage.setItem("access_token", access)

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed → log out user
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user_data")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  // Authentication
  register: (userData) => api.post("/auth/register/", userData),
  login: (credentials) => api.post("/auth/login/", credentials),
  logout: (refreshToken) => api.post("/auth/logout/", { refresh_token: refreshToken }),
  refreshToken: (refreshToken) => api.post("/auth/token/refresh/", { refresh: refreshToken }),

  // User
  getUser: () => api.get("/auth/user/"),
  updateUser: (userData) => api.patch("/auth/user/", userData),
  getProfile: () => api.get("/auth/profile/"),
  updateProfile: (profileData) => api.patch("/auth/profile/", profileData),
  getDashboard: () => api.get("/auth/dashboard/"),

  // Password
  changePassword: (passwordData) => api.post("/auth/password/change/", passwordData),
  resetPassword: (email) => api.post("/auth/password/reset/", { email }),
  confirmPasswordReset: (tokenData) => api.post("/auth/password/reset/confirm/", tokenData),

  // Email
  verifyEmail: (token) => api.post("/auth/email/verify/", { token }),
  resendVerification: () => api.post("/auth/email/resend/"),
}

export default api
