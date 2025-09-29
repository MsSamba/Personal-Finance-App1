"use client"

import { useState, useEffect } from "react"
import { useFinance } from "../context/FinanceContext"
import { EmptyState } from "../components/EmptyState"
import { formatCurrencyWithSign, CURRENCY_SYMBOL } from "../utils/currency"
import { toast } from "sonner"

export function Transactions() {
  const {
    transactions,
    transactionsLoading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    clearError,
    budgets,
    budgetCategories,
  } = useFinance()

  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    type: "expense",
    category: "",
  })
  const [formLoading, setFormLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const categoriesWithBudgets =
    budgetCategories?.filter((category) =>
      budgets?.some((budget) => budget.category === category.id && budget.status === "active"),
    ) || []

  // Fetch transactions on mount + search
  useEffect(() => {
    if (searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        fetchTransactions({ search: searchTerm })
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      fetchTransactions()
    }
  }, [searchTerm, fetchTransactions])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const transactionData = {
        amount: Number.parseFloat(formData.amount),
        description: formData.description,
        type: formData.type,
        date: new Date().toISOString().split("T")[0],
        ...(formData.type === "expense" && { category: formData.category }),
      }

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, transactionData)
        setEditingTransaction(null)
        toast.success("Transaction updated successfully", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "var(--success)",
            border: "1px solid var(--success)",
            color: "var(--success-foreground)",
            borderRadius: "0.75rem",
            padding: "1rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            boxShadow: "0 10px 15px -3px rgba(34, 197, 94, 0.2), 0 4px 6px -2px rgba(34, 197, 94, 0.1)",
            backdropFilter: "blur(8px)",
          },
        })
      } else {
        await createTransaction(transactionData)
        toast.success("Transaction added successfully", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "var(--success)",
            border: "1px solid var(--success)",
            color: "var(--success-foreground)",
            borderRadius: "0.75rem",
            padding: "1rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            boxShadow: "0 10px 15px -3px rgba(34, 197, 94, 0.2), 0 4px 6px -2px rgba(34, 197, 94, 0.1)",
            backdropFilter: "blur(8px)",
          },
        })
      }

      setFormData({ amount: "", description: "", type: "expense", category: "" })
      setShowForm(false)
    } catch (error) {
      console.error("Transaction operation failed:", error)
      toast.error("Failed to save transaction", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "var(--destructive)",
          border: "1px solid var(--destructive)",
          color: "var(--destructive-foreground)",
          borderRadius: "0.75rem",
          padding: "1rem",
          fontSize: "0.875rem",
          fontWeight: "500",
          boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.2), 0 4px 6px -2px rgba(239, 68, 68, 0.1)",
          backdropFilter: "blur(8px)",
        },
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      amount: Math.abs(Number.parseFloat(transaction.amount)).toString(),
      description: transaction.description,
      type: transaction.type,
      category: transaction.category || "",
    })
    setShowForm(true)
  }

  const handleDelete = (transactionId) => {
    toast(
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-red-500 text-white px-5 py-4 rounded-t-lg flex justify-between items-center -mx-6 -mt-6 mb-5">
          <h3 className="font-semibold text-lg">Confirm Deletion</h3>
          <button
            onClick={() => toast.dismiss()}
            className="text-white hover:text-red-100 transition-colors p-1 hover:bg-red-600 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-gray-700 text-sm leading-relaxed mb-8 px-1">
          Are you sure you want to delete this item? This action cannot be undone.
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => toast.dismiss()}
            className="bg-gray-500 text-white px-5 py-2.5 rounded-md hover:bg-gray-600 transition-colors duration-200 font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                await deleteTransaction(transactionId)
                toast.dismiss()
                toast.success("Transaction deleted successfully", {
                  duration: 3000,
                  position: "top-center",
                  style: {
                    background: "var(--success)",
                    border: "1px solid var(--success)",
                    color: "var(--success-foreground)",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    boxShadow: "0 10px 15px -3px rgba(34, 197, 94, 0.2), 0 4px 6px -2px rgba(34, 197, 94, 0.1)",
                    backdropFilter: "blur(8px)",
                  },
                })
              } catch (error) {
                console.error("Delete failed:", error)
                toast.dismiss()
                toast.error("Failed to delete transaction", {
                  duration: 4000,
                  position: "top-center",
                  style: {
                    background: "var(--destructive)",
                    border: "1px solid var(--destructive)",
                    color: "var(--destructive-foreground)",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.2), 0 4px 6px -2px rgba(239, 68, 68, 0.1)",
                    backdropFilter: "blur(8px)",
                  },
                })
              }
            }}
            className="bg-red-500 text-white px-5 py-2.5 rounded-md hover:bg-red-600 transition-colors duration-200 font-medium text-sm"
          >
            Delete
          </button>
        </div>
      </div>,
      {
        duration: 15000,
        position: "top-center",
        style: {
          background: "white",
          border: "1px solid #d1d5db",
          borderRadius: "0.75rem",
          padding: "1.5rem",
          fontSize: "0.875rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          maxWidth: "420px",
          width: "100%",
          margin: "0 auto",
          marginTop: "20vh",
          zIndex: 9999,
        },
      },
    )
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTransaction(null)
    setFormData({ amount: "", description: "", type: "expense", category: "" })
    clearError()
  }

  const handleTypeChange = (newType) => {
    setFormData({
      ...formData,
      type: newType,
      category: newType === "income" ? "" : formData.category,
    })
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
            setFormData({ amount: "", description: "", type: "expense", category: "" })
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
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
            <div className="flex-shrink-0">⚠️</div>
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

            {formData.type === "expense" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                {categoriesWithBudgets.length > 0 ? (
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={formLoading}
                  >
                    <option value="">Select a category</option>
                    {categoriesWithBudgets.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      No budget categories available. Please create a budget first to track expenses.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className={formData.type === "income" ? "md:col-start-2" : ""}>
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

            <div className="md:col-span-2">
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

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={formLoading || (formData.type === "expense" && !formData.category)}
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
                      {transaction.type === "expense" ? transaction.category || "N/A" : "Income"}
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
            description="Start your financial journey by adding your first transaction."
            actionText="Add Your First Transaction"
            onAction={() => {
              setFormData({ amount: "", description: "", type: "expense", category: "" })
              setShowForm(true)
            }}
          />
        </div>
      )}
    </div>
  )
}


