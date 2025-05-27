"use client"

import { useState } from "react"
import { useFinance } from "../context/FinanceContext"

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

export function Pots() {
  const { state, dispatch } = useFinance()
  const [showForm, setShowForm] = useState(false)
  const [editingPot, setEditingPot] = useState(null)
  const [showAddMoney, setShowAddMoney] = useState(null)
  const [customAmount, setCustomAmount] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    target: "",
    color: "bg-red-500",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const potData = {
      name: formData.name,
      target: Number(formData.target),
      color: formData.color,
    }

    if (editingPot) {
      dispatch({
        type: "UPDATE_POT",
        payload: {
          id: editingPot.id,
          updates: potData,
        },
      })
      setEditingPot(null)
    } else {
      const pot = {
        id: Date.now().toString(),
        saved: 0,
        ...potData,
      }
      dispatch({ type: "ADD_POT", payload: pot })
    }

    setFormData({ name: "", target: "", color: "bg-red-500" })
    setShowForm(false)
  }

  const handleEdit = (pot) => {
    setEditingPot(pot)
    setFormData({
      name: pot.name,
      target: pot.target.toString(),
      color: pot.color,
    })
    setShowForm(true)
  }

  const handleDelete = (potId) => {
    if (window.confirm("Are you sure you want to delete this pot?")) {
      dispatch({ type: "DELETE_POT", payload: potId })
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingPot(null)
    setFormData({ name: "", target: "", color: "bg-red-500" })
  }

  const handleAddMoney = (potId, amount) => {
    const pot = state.pots.find((p) => p.id === potId)
    if (pot) {
      dispatch({
        type: "UPDATE_POT",
        payload: {
          id: potId,
          updates: { saved: Math.min(pot.saved + amount, pot.target) },
        },
      })
    }
    setShowAddMoney(null)
    setCustomAmount("")
  }

  const handleWithdrawMoney = (potId, amount) => {
    const pot = state.pots.find((p) => p.id === potId)
    if (pot) {
      dispatch({
        type: "UPDATE_POT",
        payload: {
          id: potId,
          updates: { saved: Math.max(pot.saved - amount, 0) },
        },
      })
    }
  }

  const handleCustomAmount = (potId) => {
    const amount = Number(customAmount)
    if (amount > 0) {
      handleAddMoney(potId, amount)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Pots</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          <span className="mr-2">+</span>
          Add Pot
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">{editingPot ? "Edit Pot" : "Add New Pot"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
              <input
                type="number"
                step="0.01"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingPot ? "Update Pot" : "Add Pot"}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.pots.map((pot) => {
          const percentage = (pot.saved / pot.target) * 100
          const remaining = pot.target - pot.saved

          return (
            <div key={pot.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{pot.name}</h3>
                <div className={`w-4 h-4 rounded-full ${pot.color}`} />
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">${pot.saved.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">of ${pot.target.toFixed(2)} target</p>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className={`h-3 rounded-full ${pot.color}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{percentage.toFixed(1)}% saved</span>
                  <span className="text-gray-600">${remaining.toFixed(2)} to go</span>
                </div>

                {showAddMoney === pot.id ? (
                  <div className="space-y-2">
                    <input
                      type="number"
                      step="0.01"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCustomAmount(pot.id)}
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
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddMoney(pot.id, 50)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors"
                      >
                        Add $50
                      </button>
                      <button
                        onClick={() => handleAddMoney(pot.id, 100)}
                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md text-sm hover:bg-green-700 transition-colors"
                      >
                        Add $100
                      </button>
                    </div>
                    <button
                      onClick={() => setShowAddMoney(pot.id)}
                      className="w-full bg-purple-600 text-white py-2 px-3 rounded-md text-sm hover:bg-purple-700 transition-colors"
                    >
                      Custom Amount
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleWithdrawMoney(pot.id, 50)}
                        className="flex-1 bg-orange-600 text-white py-2 px-3 rounded-md text-sm hover:bg-orange-700 transition-colors"
                      >
                        Withdraw $50
                      </button>
                      <button
                        onClick={() => handleEdit(pot)}
                        className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-md text-sm hover:bg-gray-700 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <button
                      onClick={() => handleDelete(pot.id)}
                      className="w-full bg-red-600 text-white py-2 px-3 rounded-md text-sm hover:bg-red-700 transition-colors"
                    >
                      Delete Pot
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
