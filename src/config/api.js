import axios from "axios"

// ✅ Use Vite env vars instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api"
console.log("🔗 API Base URL:", API_BASE_URL)


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

// Transaction API endpoints
export const transactionAPI = {
  // Transaction CRUD
  getTransactions: (params = {}) => api.get("/transactions/transactions/", { params }),
  getTransaction: (id) => api.get(`/transactions/transactions/${id}/`),
  createTransaction: (transactionData) => api.post("/transactions/transactions/", transactionData),
  updateTransaction: (id, transactionData) => api.patch(`/transactions/transactions/${id}/`, transactionData),
  deleteTransaction: (id) => api.delete(`/transactions/transactions/${id}/`),

  // Transaction analytics
  getTransactionSummary: (params = {}) => api.get("/transactions/transactions/summary/", { params }),
  getRecentTransactions: (limit = 10) => api.get("/transactions/transactions/recent/", { params: { limit } }),

  // // Categories
  // getCategories: (params = {}) => api.get("/transactions/categories/", { params }),
  // createDefaultCategories: () => api.post("/transactions/categories/create_defaults/"),
}

// Budget API endpoints
export const budgetAPI = {
  // Budget CRUD
  getBudgets: (params = {}) => api.get("/budgets/budgets/", { params }),
  getBudget: (id) => api.get(`/budgets/budgets/${id}/`),
  createBudget: (budgetData) => api.post("/budgets/budgets/", budgetData),
  updateBudget: (id, budgetData) => api.patch(`/budgets/budgets/${id}/`, budgetData),
  deleteBudget: (id) => api.delete(`/budgets/budgets/${id}/`),

  // Budget actions
  resetBudgetSpent: (id) => api.post(`/budgets/budgets/${id}/reset_spent/`),
  checkAlerts: () => api.post("/budgets/budgets/check_alerts/"),

  // Budget analytics
  getBudgetAnalytics: (params = {}) => api.get("/budgets/budgets/analytics/", { params }),
  getBudgetSummary: (params = {}) => api.get("/budgets/budgets/summary/", { params }),

  // Budget history and alerts
  getBudgetHistory: (params = {}) => api.get("/budgets/budget-history/", { params }),
  getBudgetAlerts: (params = {}) => api.get("/budgets/budget-alerts/", { params }),
  markAlertAsRead: (id) => api.post(`/budgets/budget-alerts/${id}/mark_as_read/`),

  // Budget templates
  getBudgetTemplates: (params = {}) => api.get("/budgets/budget-templates/", { params }),
  createBudgetTemplate: (templateData) => api.post("/budgets/budget-templates/", templateData),
  applyBudgetTemplate: (id) => api.post(`/budgets/budget-templates/${id}/apply_template/`),
}

// Savings API endpoints
export const savingsAPI = {
  // Savings Account
  getSavingsAccount: () => api.get("/savings/account/my_account/"),
  updateSavingsAccount: (accountData) => api.patch("/savings/account/", accountData),
  allocateToGoal: (allocationData) => api.post("/savings/account/allocate_to_goal/", allocationData),
  getSavingsTransactions: (params = {}) => api.get("/savings/account/transactions/", { params }),

  // Savings Goals CRUD
  getSavingsGoals: (params = {}) => api.get("/savings/goals/", { params }),
  getSavingsGoal: (id) => api.get(`/savings/savings/goals/${id}/`),
  createSavingsGoal: (goalData) => api.post("/savings/savings/goals/", goalData),
  updateSavingsGoal: (id, goalData) => api.patch(`/savings/goals/${id}/`, goalData),
  deleteSavingsGoal: (id) => api.delete(`/savings/goals/${id}/`),

  // Savings Goal Actions
  addFundsToGoal: (id, fundData) => api.post(`/savings/goals/${id}/add_funds/`, fundData),
  withdrawFromGoal: (id, withdrawData) => api.post(`/savings/goals/${id}/withdraw_funds/`, withdrawData),
  getGoalAllocations: (id, params = {}) => api.get(`/savings/goals/${id}/allocations/`, { params }),

  // Savings Analytics
  getSavingsAnalytics: (params = {}) => api.get("/savings/goals/analytics/", { params }),
  getSavingsSummary: (params = {}) => api.get("/savings/goals/summary/", { params }),

  // Savings Templates
  getSavingsTemplates: (params = {}) => api.get("/savings/templates/", { params }),
  applySavingsTemplate: (id, templateData) => api.post(`/savings/templates/${id}/apply_template/`, templateData),

  // Savings Settings
  getSavingsSettings: () => api.get("/savings/settings/my_settings/"),
  updateSavingsSettings: (settingsData) => api.patch("/savings/settings/update_settings/", settingsData),

  // Savings Reports
  getSavingsReports: (params = {}) => api.get("/savings/reports/", { params }),
  generateSavingsReport: (reportData) => api.post("/savings/reports/generate_report/", reportData),
}
export default api
