"use client"

import { useState } from "react"
import { useFinance } from "../context/FinanceContext"
import { EmptyState } from "../components/EmptyState"

export function RecurringBills() {
  const { state, dispatch } = useFinance()
  const [showForm, setShowForm] = useState(false)
  const [editingBill, setEditingBill] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    dueDate: "",
    frequency: "monthly",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const billData = {
      name: formData.name,
      amount: Number(formData.amount),
      dueDate: formData.dueDate,
      frequency: formData.frequency,
    }

    if (editingBill) {
      dispatch({
        type: "UPDATE_RECURRING_BILL",
        payload: {
          id: editingBill.id,
          updates: billData,
        },
      })
      setEditingBill(null)
    } else {
      const bill = {
        id: Date.now().toString(),
        paid: false,
        ...billData,
      }
      dispatch({ type: "ADD_RECURRING_BILL", payload: bill })
    }

    setFormData({ name: "", amount: "", dueDate: "", frequency: "monthly" })
    setShowForm(false)
  }

  const handleEdit = (bill) => {
    setEditingBill(bill)
    setFormData({
      name: bill.name,
      amount: bill.amount.toString(),
      dueDate: bill.dueDate,
      frequency: bill.frequency,
    })
    setShowForm(true)
  }

  const handleDelete = (billId) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      dispatch({ type: "DELETE_RECURRING_BILL", payload: billId })
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingBill(null)
    setFormData({ name: "", amount: "", dueDate: "", frequency: "monthly" })
  }

  const togglePaid = (billId) => {
    dispatch({ type: "TOGGLE_BILL_PAID", payload: billId })
  }

  const [isResetting, setIsResetting] = useState(false)
  const [isMarkingAllPaid, setIsMarkingAllPaid] = useState(false)

  const markAllPaid = async () => {
    if (window.confirm("Mark all unpaid bills as paid?")) {
      setIsMarkingAllPaid(true)
      dispatch({ type: "MARK_ALL_BILLS_PAID" })
      // Add a small delay to show the action completed
      setTimeout(() => setIsMarkingAllPaid(false), 500)
    }
  }

  const resetAllBills = async () => {
    if (window.confirm("Reset all bills to unpaid status? This will mark all bills as pending payment.")) {
      setIsResetting(true)
      dispatch({ type: "RESET_ALL_BILLS" })
      // Add a small delay to show the action completed
      setTimeout(() => setIsResetting(false), 500)
    }
  }

  const totalMonthlyBills = state.recurringBills
    .filter((bill) => bill.frequency === "monthly")
    .reduce((sum, bill) => sum + bill.amount, 0)

  const paidBills = state.recurringBills.filter((bill) => bill.paid)
  const unpaidBills = state.recurringBills.filter((bill) => !bill.paid)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Recurring Bills</h1>
        <div className="flex gap-2">
          <button
            onClick={markAllPaid}
            disabled={isMarkingAllPaid}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isMarkingAllPaid ? "Marking..." : "Mark All Paid"}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2">+</span>
            Add Bill
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Total Monthly Bills</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">KES {totalMonthlyBills.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Paid This Month</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">{paidBills.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Upcoming Bills</h3>
          <p className="text-2xl font-bold text-red-600 mt-2">{unpaidBills.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Total Bills</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{state.recurringBills.length}</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">
            {editingBill ? "Edit Recurring Bill" : "Add New Recurring Bill"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingBill ? "Update Bill" : "Add Bill"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {state.recurringBills.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">All Bills</h3>
            <button
              onClick={resetAllBills}
              disabled={isResetting}
              className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {isResetting ? "Resetting..." : "Reset All"}
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {state.recurringBills.map((bill) => (
              <div key={bill.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => togglePaid(bill.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      bill.paid ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-green-500"
                    }`}
                  >
                    {bill.paid && "✓"}
                  </button>
                  <div>
                    <p className={`font-medium ${bill.paid ? "text-gray-500 line-through" : "text-gray-900"}`}>
                      {bill.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Due: {bill.dueDate} • {bill.frequency}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`font-semibold ${bill.paid ? "text-gray-500" : "text-gray-900"}`}>
                      KES {bill.amount.toFixed(2)}
                    </p>
                    <p className={`text-xs ${bill.paid ? "text-green-600" : "text-red-600"}`}>
                      {bill.paid ? "Paid" : "Pending"}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(bill)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(bill.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border">
          <EmptyState
            icon="🔄"
            title="No Recurring Bills Set Up"
            description="Stay on top of your monthly expenses by adding your recurring bills. Never miss a payment and keep track of your regular commitments."
            actionText="Add Your First Bill"
            onAction={() => setShowForm(true)}
          />
        </div>
      )}
    </div>
  )
}
