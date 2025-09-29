"use client"

import { useState } from "react"
import { useFinance } from "../context/FinanceContext"
import { EmptyState } from "../components/EmptyState"
import { toast } from "sonner"

export function RecurringBills() {
  const {
    recurringBills,
    loading,
    createRecurringBill,
    updateRecurringBill,
    deleteRecurringBill,
    toggleBillPaid,
    markAllBillsPaid,
    clearError,
  } = useFinance()

  const [showForm, setShowForm] = useState(false)
  const [editingBill, setEditingBill] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    dueDate: "",
    frequency: "monthly",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const billData = {
      name: formData.name,
      amount: Number(formData.amount),
      dueDate: formData.dueDate,
      frequency: formData.frequency,
    }

    try {
      if (editingBill) {
        await updateRecurringBill(editingBill.id, billData)
        setEditingBill(null)
      } else {
        await createRecurringBill(billData)
      }

      setFormData({ name: "", amount: "", dueDate: "", frequency: "monthly" })
      setShowForm(false)
      clearError()
    } catch (error) {
      console.error("Error saving bill:", error)
    }
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

  const handleDelete = async (billId) => {
    toast(
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-red-500 px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">Confirm Deletion</h3>
          <button onClick={() => toast.dismiss()} className="text-white hover:text-red-100 transition-colors">
            ✕
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-6 leading-relaxed">
            Are you sure you want to delete this bill? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => toast.dismiss()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  await deleteRecurringBill(billId)
                  toast.dismiss()
                  toast.success("Bill deleted successfully!", {
                    duration: 3000,
                    position: "top-center",
                  })
                  clearError()
                } catch (error) {
                  console.error("Error deleting bill:", error)
                  toast.dismiss()
                  toast.error("Failed to delete bill. Please try again.", {
                    duration: 4000,
                    position: "top-center",
                  })
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>,
      {
        duration: Number.POSITIVE_INFINITY,
        position: "top-center",
        style: {
          background: "transparent",
          border: "none",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          padding: 0,
          marginTop: "2rem",
        },
      },
    )
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingBill(null)
    setFormData({ name: "", amount: "", dueDate: "", frequency: "monthly" })
  }

  const togglePaid = async (billId) => {
    try {
      await toggleBillPaid(billId)
      clearError()
    } catch (error) {
      console.error("Error toggling bill status:", error)
    }
  }

  const [isResetting, setIsResetting] = useState(false)
  const [isMarkingAllPaid, setIsMarkingAllPaid] = useState(false)

  const markAllPaid = async () => {
    toast(
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-green-500 px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">Mark All Bills Paid</h3>
          <button onClick={() => toast.dismiss()} className="text-white hover:text-green-100 transition-colors">
            ✕
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-6 leading-relaxed">
            Mark all unpaid bills as paid? This will update the status of all pending bills.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => toast.dismiss()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                setIsMarkingAllPaid(true)
                try {
                  await markAllBillsPaid()
                  toast.dismiss()
                  toast.success("All bills marked as paid!", {
                    duration: 3000,
                    position: "top-center",
                  })
                  clearError()
                } catch (error) {
                  console.error("Error marking all bills paid:", error)
                  toast.dismiss()
                  toast.error("Failed to mark bills as paid. Please try again.", {
                    duration: 4000,
                    position: "top-center",
                  })
                } finally {
                  setTimeout(() => setIsMarkingAllPaid(false), 500)
                }
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Mark All Paid
            </button>
          </div>
        </div>
      </div>,
      {
        duration: Number.POSITIVE_INFINITY,
        position: "top-center",
        style: {
          background: "transparent",
          border: "none",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          padding: 0,
          marginTop: "2rem",
        },
      },
    )
  }

  const handleResetAllBills = async () => {
    toast(
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-yellow-500 px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">Reset All Bills</h3>
          <button onClick={() => toast.dismiss()} className="text-white hover:text-yellow-100 transition-colors">
            ✕
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-6 leading-relaxed">
            Reset all bills to unpaid status? This will mark all bills as pending payment.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => toast.dismiss()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                setIsResetting(true)
                try {
                  await clearError()
                  toast.dismiss()
                  toast.success("All bills reset to unpaid status!", {
                    duration: 3000,
                    position: "top-center",
                  })
                } catch (error) {
                  console.error("Error resetting all bills:", error)
                  toast.dismiss()
                  toast.error("Failed to reset bills. Please try again.", {
                    duration: 4000,
                    position: "top-center",
                  })
                } finally {
                  setTimeout(() => setIsResetting(false), 500)
                }
              }}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>,
      {
        duration: Number.POSITIVE_INFINITY,
        position: "top-center",
        style: {
          background: "transparent",
          border: "none",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          padding: 0,
          marginTop: "2rem",
        },
      },
    )
  }

  const totalMonthlyBills = recurringBills
    .filter((bill) => bill.frequency === "monthly")
    .reduce((sum, bill) => sum + bill.amount, 0)

  const paidBills = recurringBills.filter((bill) => bill.paid)
  const unpaidBills = recurringBills.filter((bill) => !bill.paid)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Recurring Bills</h1>
        <div className="flex gap-2">
          <button
            onClick={markAllPaid}
            disabled={isMarkingAllPaid || loading}
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
          <p className="text-2xl font-bold text-gray-900 mt-2">KES {Number(totalMonthlyBills || 0).toFixed(2)}</p>
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
          <p className="text-2xl font-bold text-gray-900 mt-2">{recurringBills.length}</p>
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
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : editingBill ? "Update Bill" : "Add Bill"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {recurringBills.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">All Bills</h3>
            <button
              onClick={handleResetAllBills}
              disabled={isResetting || loading}
              className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {isResetting ? "Resetting..." : "Reset All"}
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {recurringBills.map((bill) => (
              <div key={bill.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => togglePaid(bill.id)}
                    disabled={loading}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors disabled:opacity-50 ${
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
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(bill.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50"
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
