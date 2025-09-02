"use client"

import { useState, useEffect } from "react"
import { useFinance } from "../context/FinanceContext"
import { EmptyState } from "../components/EmptyState"
import { BudgetAnalytics } from "../components/BudgetAnalytics"
import { CATEGORY_ICONS } from "../utils/categories"
import { formatCurrency, CURRENCY_SYMBOL } from "../utils/currency"

const colorOptions = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-indigo-500",
  "bg-pink-500",
  "bg-gray-500",
]

const periodOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
]

// Get expense categories (exclude Income)
const getExpenseCategories = (categories) => {
  if (!Array.isArray(categories)) return []
  return categories.filter((category) => !category.is_income_category)
}

export function Budgets() {
  const {
    budgets,
    categories,
    budgetsLoading,
    categoriesLoading,
    error,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    resetBudgetSpent,
    clearError,
  } = useFinance()

  const [showForm, setShowForm] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    limit: "",
    period: "monthly",
    color: "bg-blue-500",
    alert_threshold: "80",
    email_alerts: true,
    sms_alerts: false,
  })

  // Get available categories for budgets
  const expenseCategories = getExpenseCategories(categories || [])
  const availableCategories = expenseCategories.filter(
    (category) =>
      !budgets.some((budget) => budget.category === category.name && budget.status === "active") ||
      (editingBudget && editingBudget.category === category.name),
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const budgetData = {
        category: formData.category,
        limit: Number.parseFloat(formData.limit),
        period: formData.period,
        color: formData.color,
        alert_threshold: Number.parseFloat(formData.alert_threshold),
        email_alerts: formData.email_alerts,
        sms_alerts: formData.sms_alerts,
      }

      if (editingBudget) {
        await updateBudget(editingBudget.id, budgetData)
        setEditingBudget(null)
      } else {
        await createBudget(budgetData)
      }

      setFormData({
        category: "",
        limit: "",
        period: "monthly",
        color: "bg-blue-500",
        alert_threshold: "80",
        email_alerts: true,
        sms_alerts: false,
      })
      setShowForm(false)
    } catch (error) {
      console.error("Budget operation failed:", error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (budget) => {
    setEditingBudget(budget)
    setFormData({
      category: budget.category,
      limit: budget.limit.toString(),
      period: budget.period,
      color: budget.color,
      alert_threshold: budget.alert_threshold.toString(),
      email_alerts: budget.email_alerts,
      sms_alerts: budget.sms_alerts,
    })
    setShowForm(true)
  }

  const handleDelete = async (budgetId) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      try {
        await deleteBudget(budgetId)
      } catch (error) {
        console.error("Delete failed:", error)
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingBudget(null)
    setFormData({
      category: "",
      limit: "",
      period: "monthly",
      color: "bg-blue-500",
      alert_threshold: "80",
      email_alerts: true,
      sms_alerts: false,
    })
    clearError()
  }

  const handleResetSpent = async (budgetId) => {
    if (window.confirm("Are you sure you want to reset the spent amount to KES 0?")) {
      try {
        await resetBudgetSpent(budgetId)
      } catch (error) {
        console.error("Reset failed:", error)
      }
    }
  }

  // Get category icon for display
  const getCategoryIcon = (categoryName) => {
    const category = categories.find((cat) => cat.name === categoryName)
    return category?.icon || CATEGORY_ICONS[categoryName] || "💰"
  }

  if (budgetsLoading && budgets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700 transition-colors"
          >
            <span className="mr-2">📊</span>
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
            disabled={availableCategories.length === 0 && !editingBudget}
          >
            <span className="mr-2">+</span>
            Add Budget
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button onClick={clearError} className="mt-2 text-sm text-red-600 hover:text-red-800 underline">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {showAnalytics && <BudgetAnalytics />}

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">{editingBudget ? "Edit Budget" : "Add New Budget"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={formLoading}
                >
                  <option value="">Select a category</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                {availableCategories.length === 0 && !editingBudget && (
                  <p className="text-xs text-gray-500 mt-1">All categories already have active budgets</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Limit</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {CURRENCY_SYMBOL}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                    className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={formLoading}
                >
                  {periodOptions.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={formLoading}
                >
                  {colorOptions.map((color) => (
                    <option key={color} value={color}>
                      {color.replace("bg-", "").replace("-500", "")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alert Threshold (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.alert_threshold}
                  onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="80"
                  disabled={formLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Get alerts when spending reaches this percentage</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alert Preferences</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.email_alerts}
                    onChange={(e) => setFormData({ ...formData, email_alerts: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={formLoading}
                  />
                  <span className="ml-2 text-sm text-gray-700">📧 Email alerts</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.sms_alerts}
                    onChange={(e) => setFormData({ ...formData, sms_alerts: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={formLoading}
                  />
                  <span className="ml-2 text-sm text-gray-700">📱 SMS alerts</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={formLoading || !formData.category || !formData.limit}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingBudget ? "Updating..." : "Creating..."}
                  </div>
                ) : editingBudget ? (
                  "Update Budget"
                ) : (
                  "Create Budget"
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={formLoading}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const percentage = budget.percentage_used || 0
            const remaining = budget.remaining || 0
            const isOverBudget = budget.is_over_budget || false
            const isAlertThreshold = budget.is_alert_threshold_reached || false

            return (
              <div
                key={budget.id}
                className={`bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow ${
                  isOverBudget ? "border-red-300" : isAlertThreshold ? "border-yellow-300" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(budget.category)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
                      <p className="text-xs text-gray-500 capitalize">{budget.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${budget.color}`} />
                    {isOverBudget && <span className="text-red-500 text-sm">⚠️</span>}
                    {isAlertThreshold && !isOverBudget && <span className="text-yellow-500 text-sm">⚠️</span>}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className={`font-medium ${isOverBudget ? "text-red-600" : "text-gray-900"}`}>
                      {formatCurrency(budget.spent)}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        isOverBudget ? "bg-red-500" : budget.color
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remaining</span>
                    <span className={`font-medium ${remaining < 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(remaining)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Limit: {formatCurrency(budget.limit)}</span>
                    <span>{percentage.toFixed(1)}% used</span>
                  </div>

                  {budget.days_remaining !== undefined && (
                    <div className="text-xs text-gray-500">
                      {budget.days_remaining > 0
                        ? `${budget.days_remaining} days remaining`
                        : budget.is_current_period
                        ? "Period ended"
                        : "Future period"}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleResetSpent(budget.id)}
                      className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded-md text-sm hover:bg-yellow-700 transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md text-sm hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border">
          <EmptyState
            icon="📊"
            title="No Budgets Created"
            description="Take control of your spending by creating budgets for different categories. Set limits, choose periods, and get alerts to achieve your financial goals."
            actionText="Create Your First Budget"
            onAction={() => setShowForm(true)}
          />
        </div>
      )}
    </div>
  )
}
