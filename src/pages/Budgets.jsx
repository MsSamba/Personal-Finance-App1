"use client"

import { useState } from "react"
import { useFinance } from "../context/FinanceContext"
import { EmptyState } from "../components/EmptyState"
import { TRANSACTION_CATEGORIES, CATEGORY_ICONS } from "../utils/categories"

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

// Exclude Income from budget categories since budgets are for expenses
const BUDGET_CATEGORIES = TRANSACTION_CATEGORIES.filter(
  (category) => category !== "Income" && category !== "Savings and Investments",
)

export function Budgets() {
  const { state, dispatch } = useFinance()
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [formData, setFormData] = useState({
    category: "",
    limit: "",
    color: "bg-blue-500",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const budgetData = {
      category: formData.category,
      limit: Number(formData.limit),
      color: formData.color,
    }

    if (editingBudget) {
      dispatch({
        type: "UPDATE_BUDGET",
        payload: {
          id: editingBudget.id,
          updates: budgetData,
        },
      })
      setEditingBudget(null)
    } else {
      const budget = {
        id: Date.now().toString(),
        spent: 0,
        ...budgetData,
      }
      dispatch({ type: "ADD_BUDGET", payload: budget })
    }

    setFormData({ category: "", limit: "", color: "bg-blue-500" })
    setShowForm(false)
  }

  const handleEdit = (budget) => {
    setEditingBudget(budget)
    setFormData({
      category: budget.category,
      limit: budget.limit.toString(),
      color: budget.color,
    })
    setShowForm(true)
  }

  const handleDelete = (budgetId) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      dispatch({ type: "DELETE_BUDGET", payload: budgetId })
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingBudget(null)
    setFormData({ category: "", limit: "", color: "bg-blue-500" })
  }

  const handleResetSpent = (budgetId) => {
    if (window.confirm("Are you sure you want to reset the spent amount to $0?")) {
      dispatch({
        type: "UPDATE_BUDGET",
        payload: {
          id: budgetId,
          updates: { spent: 0 },
        },
      })
    }
  }

  // Get categories that don't already have budgets
  const availableCategories = BUDGET_CATEGORIES.filter(
    (category) =>
      !state.budgets.some((budget) => budget.category === category) ||
      (editingBudget && editingBudget.category === category),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          disabled={availableCategories.length === 0 && !editingBudget}
        >
          <span className="mr-2">+</span>
          Add Budget
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">{editingBudget ? "Edit Budget" : "Add New Budget"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_ICONS[category]} {category}
                  </option>
                ))}
              </select>
              {availableCategories.length === 0 && !editingBudget && (
                <p className="text-xs text-gray-500 mt-1">All categories already have budgets</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Limit</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">KES</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  className="w-full pl-14 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {colorOptions.map((color) => (
                  <option key={color} value={color}>
                    {color.replace("bg-", "").replace("-500", "")}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3 flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                {editingBudget ? "Update Budget" : "Add Budget"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {state.budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.budgets.map((budget) => {
            const percentage = (budget.spent / budget.limit) * 100
            const remaining = budget.limit - budget.spent

            return (
              <div
                key={budget.id}
                className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{CATEGORY_ICONS[budget.category]}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${budget.color}`} />
                    <div className="relative">
                      <button className="text-gray-400 hover:text-gray-600 p-1">⋮</button>
                      <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 z-10 hidden group-hover:block">
                        <button
                          onClick={() => handleEdit(budget)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleResetSpent(budget.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Reset Spent
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-medium">KES {budget.spent.toFixed(2)}</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${budget.color} ${percentage > 100 ? "bg-red-500" : ""}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remaining</span>
                    <span className={`font-medium ${remaining < 0 ? "text-red-600" : "text-green-600"}`}>
                      KES {remaining.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">Limit: KES {budget.limit.toFixed(2)}</div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors"
                    >
                      Edit
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
            description="Take control of your spending by creating budgets for different categories. Choose from our predefined categories to keep your finances organized."
            actionText="Create Your First Budget"
            onAction={() => setShowForm(true)}
          />
        </div>
      )}
    </div>
  )
}
