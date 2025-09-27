"use client"

import { useState, useEffect } from "react"
import { useFinance } from "../context/FinanceContext"
import { EmptyState } from "../components/EmptyState"
import { formatCurrency, CURRENCY_SYMBOL } from "../utils/currency"

const colorOptions = [
  "bg-red-500",
  "bg-yellow-500",
  "bg-indigo-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-blue-500",
  "bg-pink-500",
  "bg-gray-500",
]

const priorityOptions = [
  { value: "low", label: "Low", color: "text-gray-600" },
  { value: "medium", label: "Medium", color: "text-blue-600" },
  { value: "high", label: "High", color: "text-orange-600" },
  { value: "urgent", label: "Urgent", color: "text-red-600" },
]

export function Pots() {
  const {
    savingsGoals,
    savingsAccount,
    savingsLoading,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addFundsToGoal,
    withdrawFromGoal,
    allocateToGoal,
    error,
    clearError,
  } = useFinance()

  const [showForm, setShowForm] = useState(false)
  const [editingPot, setEditingPot] = useState(null)
  const [showAddMoney, setShowAddMoney] = useState(null)
  const [showWithdrawMoney, setShowWithdrawMoney] = useState(null)
  const [showAllocateFromSavings, setShowAllocateFromSavings] = useState(null)
  const [customAmount, setCustomAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    target: "",
    color: "bg-red-500",
    priority: "medium",
    target_date: "",
    description: "",
  })

  // Clear error when component mounts
  useEffect(() => {
    clearError()
  }, [clearError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    clearError()

    try {
      const goalData = {
        name: formData.name,
        target_amount: Number(formData.target),
        color: formData.color,
        priority: formData.priority,
        description: formData.description,
        target_date: formData.target_date || null,
      }

      if (editingPot) {
        await updateSavingsGoal(editingPot.id, goalData)
      } else {
        await createSavingsGoal(goalData)
      }

      // Reset form
      setFormData({
        name: "",
        target: "",
        color: "bg-red-500",
        priority: "medium",
        target_date: "",
        description: "",
      })
      setShowForm(false)
      setEditingPot(null)
    } catch (error) {
      console.error("Error saving savings goal:", error)
      // Error will be displayed via context
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (pot) => {
    setEditingPot(pot)
    setFormData({
      name: pot.name,
      target: pot.target_amount.toString(),
      color: pot.color,
      priority: pot.priority,
      target_date: pot.target_date || "",
      description: pot.description || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (potId) => {
    if (window.confirm("Are you sure you want to delete this savings goal?")) {
      try {
        await deleteSavingsGoal(potId)
      } catch (error) {
        console.error("Error deleting savings goal:", error)
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingPot(null)
    setFormData({
      name: "",
      target: "",
      color: "bg-red-500",
      priority: "medium",
      target_date: "",
      description: "",
    })
    clearError()
  }

  // const handleAddMoney = async (potId, amount) => {
  //   try {
  //     await addFundsToGoal(potId, {
  //       amount: amount,
  //       description: `Added KES ${amount} to savings goal`,
  //     })
  //     setShowAddMoney(null)
  //     setCustomAmount("")
  //   } catch (error) {
  //     // console.error("Error adding funds:", error)
  //     console.error("Error adding funds:", error.response?.data || error.message)

  //   }
  // }


  const handleAddMoney = async (potId, amount) => {
  const numericAmount = Number(amount); 
  if (!numericAmount || numericAmount <= 0) {
    console.error("Invalid amount:", amount);
    return;
  }

  try {
    await addFundsToGoal(potId, console.log("Sending addFunds payload:", {
      amount: numericAmount.toFixed(2), 
      description: `Added KES ${numericAmount} to savings goal`,
    }))
    setShowAddMoney(null)
    setCustomAmount("")
  } catch (error) {
    console.error("Error adding funds:", error.response?.data || error.message)
  }
}




  const handleWithdrawMoney = async (potId, amount) => {
    try {
      await withdrawFromGoal(potId, {
        amount: amount,
        description: `Withdrew KES ${amount} from savings goal`,
      })
      setShowWithdrawMoney(null)
      setCustomAmount("")
    } catch (error) {
      console.error("Error withdrawing funds:", error)
    }
  }

  const handleAllocateFromSavings = async (potId, amount) => {
    try {
      await allocateToGoal({
        amount: amount,
        goal_id: potId,
        description: `Allocated KES ${amount} from savings account`,
      })
      setShowAllocateFromSavings(null)
      setCustomAmount("")
    } catch (error) {
      console.error("Error allocating funds:", error)
    }
  }

  const handleCustomAmount = (potId, action) => {
    const amount = Number(customAmount)
    if (amount > 0) {
      if (action === "add") {
        handleAddMoney(potId, amount)
      } else if (action === "withdraw") {
        handleWithdrawMoney(potId, amount)
      } else if (action === "allocate") {
        handleAllocateFromSavings(potId, amount)
      }
    }
  }

  const getPriorityDisplay = (priority) => {
    const priorityOption = priorityOptions.find((option) => option.value === priority)
    return priorityOption ? priorityOption.label : "Medium"
  }

  const getPriorityColor = (priority) => {
    const priorityOption = priorityOptions.find((option) => option.value === priority)
    return priorityOption ? priorityOption.color : "text-blue-600"
  }

  const getStatusDisplay = (goal) => {
    if (goal.status === "completed") return { text: "Completed", color: "text-green-600", bg: "bg-green-100" }
    if (goal.status === "paused") return { text: "Paused", color: "text-yellow-600", bg: "bg-yellow-100" }

    const percentage = goal.progress_percentage
    if (percentage >= 90) return { text: "Almost There!", color: "text-blue-600", bg: "bg-blue-100" }
    if (percentage >= 50) return { text: "On Track", color: "text-green-600", bg: "bg-green-100" }
    return { text: "Getting Started", color: "text-gray-600", bg: "bg-gray-100" }
  }

  if (savingsLoading) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading savings goals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
          <p className="text-gray-600 mt-1">Build your financial future, one goal at a time</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <span className="mr-2">+</span>
          Add Savings Goal
        </button>
      </div>

      {/* Savings Account Summary */}
      {savingsAccount && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold opacity-90">Available Savings</h3>
              <p className="text-3xl font-bold">{formatCurrency(savingsAccount.balance)}</p>
              <p className="text-blue-100 text-sm mt-1">
                {savingsAccount.auto_save_percentage}% automatically saved from income
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <p className="text-sm opacity-90">Total Goals</p>
                <p className="text-2xl font-bold">{savingsGoals.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">{editingPot ? "Edit Savings Goal" : "Add New Savings Goal"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Emergency Fund, Vacation"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {CURRENCY_SYMBOL}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date (Optional)</label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="What is this savings goal for?"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {isSubmitting
                  ? editingPot
                    ? "Updating..."
                    : "Creating..."
                  : editingPot
                    ? "Update Goal"
                    : "Create Goal"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {savingsGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savingsGoals.map((pot) => {
            const percentage = pot.progress_percentage
            const remaining = pot.remaining_amount
            const status = getStatusDisplay(pot)

            return (
              <div key={pot.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full ${pot.color}`} />
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{pot.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                        {status.text}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(pot.priority)}`}>
                        {getPriorityDisplay(pot.priority)} Priority
                      </span>
                    </div>
                  </div>
                </div>

                {pot.description && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{pot.description}</p>}

                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(pot.current_amount)}</p>
                    <p className="text-sm text-gray-500">of {formatCurrency(pot.target_amount)} target</p>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${pot.color}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{percentage.toFixed(1)}% saved</span>
                    <span className="text-gray-600">{formatCurrency(remaining)} to go</span>
                  </div>

                  {pot.target_date && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Target: {new Date(pot.target_date).toLocaleDateString()}
                        {pot.days_remaining !== null && (
                          <span className={`ml-2 ${pot.days_remaining < 30 ? "text-red-600" : "text-gray-500"}`}>
                            ({pot.days_remaining} days left)
                          </span>
                        )}
                      </p>
                      {pot.daily_saving_required > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          Save {formatCurrency(pot.daily_saving_required)} daily to reach goal
                        </p>
                      )}
                    </div>
                  )}

                  {/* Add Money Section */}
                  {showAddMoney === pot.id ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {CURRENCY_SYMBOL}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCustomAmount(pot.id, "add")}
                          className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md text-sm hover:bg-green-700 transition-colors"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setShowAddMoney(null)}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-md text-sm hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : showWithdrawMoney === pot.id ? (
                    /* Withdraw Money Section */
                    <div className="space-y-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {CURRENCY_SYMBOL}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="Enter amount"
                          max={pot.current_amount}
                          className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCustomAmount(pot.id, "withdraw")}
                          className="flex-1 bg-orange-600 text-white py-2 px-3 rounded-md text-sm hover:bg-orange-700 transition-colors"
                        >
                          Withdraw
                        </button>
                        <button
                          onClick={() => setShowWithdrawMoney(null)}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-md text-sm hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : showAllocateFromSavings === pot.id ? (
                    /* Allocate from Savings Section */
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 mb-2">
                        Available in savings: {formatCurrency(savingsAccount?.balance || 0)}
                      </p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {CURRENCY_SYMBOL}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="Enter amount"
                          max={savingsAccount?.balance || 0}
                          className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCustomAmount(pot.id, "allocate")}
                          className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-md text-sm hover:bg-purple-700 transition-colors"
                        >
                          Allocate
                        </button>
                        <button
                          onClick={() => setShowAllocateFromSavings(null)}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-md text-sm hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Action Buttons */
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleAddMoney(pot.id, 1000)}
                          className="bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors"
                        >
                          Add KES 1,000
                        </button>
                        <button
                          onClick={() => handleAddMoney(pot.id, 5000)}
                          className="bg-green-600 text-white py-2 px-3 rounded-md text-sm hover:bg-green-700 transition-colors"
                        >
                          Add KES 5,000
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setShowAddMoney(pot.id)}
                          className="bg-purple-600 text-white py-2 px-3 rounded-md text-sm hover:bg-purple-700 transition-colors"
                        >
                          Custom Amount
                        </button>
                        {savingsAccount && savingsAccount.balance > 0 && (
                          <button
                            onClick={() => setShowAllocateFromSavings(pot.id)}
                            className="bg-indigo-600 text-white py-2 px-3 rounded-md text-sm hover:bg-indigo-700 transition-colors"
                          >
                            From Savings
                          </button>
                        )}
                      </div>

                      {pot.current_amount > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setShowWithdrawMoney(pot.id)}
                            className="bg-orange-600 text-white py-2 px-3 rounded-md text-sm hover:bg-orange-700 transition-colors"
                          >
                            Withdraw
                          </button>
                          <button
                            onClick={() => handleEdit(pot)}
                            className="bg-gray-600 text-white py-2 px-3 rounded-md text-sm hover:bg-gray-700 transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => handleDelete(pot.id)}
                        className="w-full bg-red-600 text-white py-2 px-3 rounded-md text-sm hover:bg-red-700 transition-colors"
                      >
                        Delete Goal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border">
          <EmptyState
            icon="🏺"
            title="No Savings Goals Yet"
            description="Start building your financial future by creating savings goals. Whether it's an emergency fund, vacation, or dream purchase - every goal starts with the first shilling saved. Plus, 20% of your income is automatically saved!"
            actionText="Create Your First Savings Goal"
            onAction={() => setShowForm(true)}
          />
        </div>
      )}
    </div>
  )
}
