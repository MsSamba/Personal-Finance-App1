"use client"

import { useState } from "react"
import { useFinance } from "../context/FinanceContext"
import { EmptyState } from "../components/EmptyState"
import { getCategoriesByType, getDefaultCategory, CATEGORY_ICONS } from "../utils/categories"

export function Transactions() {
  const { state, dispatch } = useFinance()
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    type: "expense",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const transactionData = {
      amount: formData.type === "expense" ? -Math.abs(Number(formData.amount)) : Number(formData.amount),
      description: formData.description,
      category: formData.category,
      date: new Date().toISOString().split("T")[0],
      type: formData.type,
    }

    if (editingTransaction) {
      // Update existing transaction
      dispatch({
        type: "UPDATE_TRANSACTION",
        payload: {
          id: editingTransaction.id,
          updates: transactionData,
        },
      })
      setEditingTransaction(null)
    } else {
      // Add new transaction
      const transaction = {
        id: Date.now().toString(),
        ...transactionData,
      }
      dispatch({ type: "ADD_TRANSACTION", payload: transaction })
    }

    setFormData({ amount: "", description: "", category: "", type: "expense" })
    setShowForm(false)
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      amount: Math.abs(transaction.amount).toString(),
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
    })
    setShowForm(true)
  }

  const handleDelete = (transactionId) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      dispatch({ type: "DELETE_TRANSACTION", payload: transactionId })
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTransaction(null)
    setFormData({ amount: "", description: "", category: "", type: "expense" })
  }

  const handleTypeChange = (newType) => {
    setFormData({
      ...formData,
      type: newType,
      category: getDefaultCategory(newType),
    })
  }

  const availableCategories = getCategoriesByType(formData.type)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <button
          onClick={() => {
            setFormData({
              amount: "",
              description: "",
              category: getDefaultCategory("expense"),
              type: "expense",
            })
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          <span className="mr-2">+</span>
          Add Transaction
        </button>
      </div>

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
              >
                <option value="expense">💸 Expense</option>
                <option value="income">💰 Income</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">KES </span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-14 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
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
              />
            </div>
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
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                {editingTransaction ? "Update Transaction" : "Add Transaction"}
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

      {state.transactions.length > 0 ? (
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
                {state.transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span>{CATEGORY_ICONS[transaction.category]}</span>
                        <span>{transaction.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                        transaction.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}KES {Math.abs(transaction.amount).toFixed(2)}
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
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border">
          <EmptyState
            icon="💳"
            title="No Transactions Yet"
            description="Start your financial journey by adding your first transaction. Choose from our predefined categories to keep your finances organized."
            actionText="Add Your First Transaction"
            onAction={() => {
              setFormData({
                amount: "",
                description: "",
                category: getDefaultCategory("expense"),
                type: "expense",
              })
              setShowForm(true)
            }}
          />
        </div>
      )}
    </div>
  )
}
