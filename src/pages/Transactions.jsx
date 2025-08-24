"use client"

import { useState, useEffect } from "react"
import { useFinance } from "../context/FinanceContext"
import { EmptyState } from "../components/EmptyState"
import { getCategoriesByType, getDefaultCategory, CATEGORY_ICONS } from "../utils/categories"
import { formatCurrencyWithSign, CURRENCY_SYMBOL } from "../utils/currency"

export function Transactions() {
  const {
    transactions,
    categories,
    transactionsLoading,
    categoriesLoading,
    error,
    fetchTransactions,
    fetchCategories,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    createDefaultCategories,
    clearError,
  } = useFinance()

  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    type: "expense",
  })
  const [formLoading, setFormLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Initialize categories if empty
  useEffect(() => {
    if (categories.length === 0 && !categoriesLoading) {
      createDefaultCategories().catch(() => {
        // If creating defaults fails, just fetch existing categories
        fetchCategories()
      })
    }
  }, [categories.length, categoriesLoading, createDefaultCategories, fetchCategories])

  // Apply search filter
  useEffect(() => {
    const params = {}
    if (searchTerm) params.search = searchTerm

    fetchTransactions(params)
  }, [searchTerm, fetchTransactions])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const transactionData = {
        amount: Number.parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        type: formData.type,
        date: new Date().toISOString().split("T")[0],
      }

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, transactionData)
        setEditingTransaction(null)
      } else {
        await createTransaction(transactionData)
      }

      setFormData({
        amount: "",
        description: "",
        category: "",
        type: "expense",
      })
      setShowForm(false)
    } catch (error) {
      console.error("Transaction operation failed:", error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      amount: Math.abs(Number.parseFloat(transaction.amount)).toString(),
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
    })
    setShowForm(true)
  }

  const handleDelete = async (transactionId) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(transactionId)
      } catch (error) {
        console.error("Delete failed:", error)
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTransaction(null)
    setFormData({
      amount: "",
      description: "",
      category: "",
      type: "expense",
    })
    clearError()
  }

  const handleTypeChange = (newType) => {
    const defaultCategory = getDefaultCategory(newType, categories)
    setFormData({
      ...formData,
      type: newType,
      category: defaultCategory,
    })
  }

  // Get categories filtered by transaction type
  const availableCategories = getCategoriesByType(formData.type, categories)

  // Get category icon for display
  const getCategoryIcon = (categoryName) => {
    const category = categories.find((cat) => cat.name === categoryName)
    return category?.icon || CATEGORY_ICONS[categoryName] || "💰"
  }

  if (transactionsLoading && transactions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
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
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <button
          onClick={() => {
            const defaultCategory = getDefaultCategory("expense", categories)
            setFormData({
              amount: "",
              description: "",
              category: defaultCategory,
              type: "expense",
            })
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          disabled={categories.length === 0}
        >
          <span className="mr-2">+</span>
          Add Transaction
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Transactions</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by description..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">
            {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={formLoading}
              >
                <option value="expense">💸 Expense</option>
                <option value="income">💰 Income</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {CURRENCY_SYMBOL}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                  disabled={formLoading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What was this transaction for?"
                required
                disabled={formLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              {formData.type === "income" ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                  💰 Income
                </div>
              ) : (
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                  disabled={formLoading}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.type === "income"
                  ? "Income transactions use the Income category"
                  : "Choose an expense category"}
              </p>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={formLoading || !formData.category}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingTransaction ? "Updating..." : "Adding..."}
                  </div>
                ) : editingTransaction ? (
                  "Update Transaction"
                ) : (
                  "Add Transaction"
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

      {transactions.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span>{getCategoryIcon(transaction.category)}</span>
                        <span>{transaction.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrencyWithSign(transaction.signed_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {transactionsLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border">
          <EmptyState
            icon="💳"
            title="No Transactions Yet"
            description="Start your financial journey by adding your first transaction. Choose from our predefined categories to keep your finances organized."
            actionText="Add Your First Transaction"
            onAction={() => {
              if (categories.length > 0) {
                const defaultCategory = getDefaultCategory("expense", categories)
                setFormData({
                  amount: "",
                  description: "",
                  category: defaultCategory,
                  type: "expense",
                })
                setShowForm(true)
              }
            }}
          />
        </div>
      )}
    </div>
  )
}
