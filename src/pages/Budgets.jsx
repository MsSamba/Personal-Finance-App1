"use client"

import { useState } from "react"
import { useFinance } from "../context/FinanceContext"
import { EmptyState } from "../components/EmptyState"
import { BudgetAnalytics } from "../components/BudgetAnalytics"
import { CATEGORY_ICONS } from "../utils/categories"
import { formatCurrency, CURRENCY_SYMBOL } from "../utils/currency"

// -----------------------------
// Constants
// -----------------------------
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

// Helper: filter expense-only categories
const getExpenseCategories = (categories) =>
  Array.isArray(categories) ? categories.filter((c) => !c.is_income_category) : []

// -----------------------------
// Component
// -----------------------------
export function Budgets() {
  const {
    budgets,
    budgetsLoading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    resetBudgetSpent,
    clearError,
    budgetCategories,
  } = useFinance()

  // UI states
  const [showForm, setShowForm] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    category: "",
    limit: "",
    period: "monthly",
    color: "bg-blue-500",
    alert_threshold: "80",
    email_alerts: true,
    sms_alerts: false,
  })

  // Available categories = expense categories without active budget
  const expenseCategories = getExpenseCategories(budgetCategories || [])
  const availableCategories = expenseCategories.filter(
    (c) =>
      !budgets.some((b) => b.category === c.name && b.status === "active") ||
      (editingBudget && editingBudget.category === c.name),
  )

  // -----------------------------
  // Handlers
  // -----------------------------
  const resetForm = () => {
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)

    const payload = {
      category: formData.category,
      limit: Number.parseFloat(formData.limit),
      period: formData.period,
      color: formData.color,
      alert_threshold: Number.parseFloat(formData.alert_threshold),
      email_alerts: formData.email_alerts,
      sms_alerts: formData.sms_alerts,
    }

    //debug the payload
    console.log("Submitting Budget Payload:", payload)

    try {
      editingBudget ? await updateBudget(editingBudget.id, payload) : await createBudget(payload)
      resetForm()
    } catch (err) {
      console.error("Budget save failed:", err)
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (budget) => {
    const categoryObj = budgetCategories.find((c) => c.name === budget.category)
    setEditingBudget(budget)
    setFormData({
      category: categoryObj?.id || "",
      limit: budget.limit.toString(),
      period: budget.period,
      color: budget.color,
      alert_threshold: budget.alert_threshold.toString(),
      email_alerts: budget.email_alerts,
      sms_alerts: budget.sms_alerts,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Delete this budget?")) {
      await deleteBudget(id)
    }
  }

  const handleResetSpent = async (id) => {
    if (window.confirm("Reset spent to 0?")) {
      await resetBudgetSpent(id)
    }
  }

  const getCategoryIcon = (name) => budgetCategories?.find((c) => c.name === name)?.icon || CATEGORY_ICONS[name] || "💰"

  // -----------------------------
  // Render
  // -----------------------------
  if (budgetsLoading && budgets.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </button>
          <button
            onClick={() => setShowForm(true)}
            disabled={availableCategories.length === 0 && !editingBudget}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Budget
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={clearError} className="mt-2 text-sm text-red-600 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Analytics */}
      {showAnalytics && <BudgetAnalytics />}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          {/* Category + Limit + Period + Color */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select</option>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{CURRENCY_SYMBOL}</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Period */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Period</label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {periodOptions.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {colorOptions.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("bg-", "").replace("-500", "")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Alerts */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Alert Threshold (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.alert_threshold}
              onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button type="submit" disabled={formLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md">
              {formLoading ? "Saving..." : editingBudget ? "Update" : "Create"}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-md">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Budgets List */}
      <div className="bg-white rounded-xl shadow-sm border">
        {budgets.length === 0 ? (
          <EmptyState
            icon="📊"
            title="No budgets yet"
            description="Start by creating a budget to track your expenses."
            actionText="Add Your First Budget"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((b) => {
              const pct = b.percentage_used || 0
              const isOver = b.is_over_budget
              const isThreshold = b.is_alert_threshold_reached

              return (
                <div
                  key={b.id}
                  className={`p-6 rounded-xl shadow-sm border hover:shadow-md transition ${
                    isOver ? "border-red-300" : isThreshold ? "border-yellow-300" : ""
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span>{getCategoryIcon(b.category)}</span>
                      <div>
                        <h3 className="font-semibold">{b.category}</h3>
                        <p className="text-xs text-gray-500 capitalize">{b.period}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${b.color}`} />
                      {isOver && <span className="text-red-500">⚠️</span>}
                      {!isOver && isThreshold && <span className="text-yellow-500">⚠️</span>}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spent</span>
                      <span className={isOver ? "text-red-600" : ""}>{formatCurrency(b.spent)}</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${isOver ? "bg-red-500" : b.color}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Remaining</span>
                      <span className={b.remaining < 0 ? "text-red-600" : "text-green-600"}>
                        {formatCurrency(b.remaining)}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Limit: {formatCurrency(b.limit)}</span>
                      <span>{pct.toFixed(1)}% used</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(b)}
                      className="flex-1 bg-blue-600 text-white py-1 rounded-md text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleResetSpent(b.id)}
                      className="flex-1 bg-yellow-600 text-white py-1 rounded-md text-sm"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="flex-1 bg-red-600 text-white py-1 rounded-md text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

