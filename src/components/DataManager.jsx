"use client"

import { useState } from "react"
import { useFinance } from "../context/FinanceContext"
import { TrashIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline"

export function DataManager() {
  const { dispatch } = useFinance()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleExportData = () => {
    try {
      const data = localStorage.getItem("personal-finance-app-data")
      if (data) {
        const blob = new Blob([data], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `finance-data-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error exporting data:", error)
      alert("Error exporting data. Please try again.")
    }
  }

  const handleImportData = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result)
          localStorage.setItem("personal-finance-app-data", JSON.stringify(importedData))
          window.location.reload() // Reload to apply imported data
        } catch (error) {
          console.error("Error importing data:", error)
          alert("Invalid file format. Please select a valid backup file.")
        }
      }
      reader.readAsText(file)
    }
  }

  const handleClearData = () => {
    if (showConfirm) {
      localStorage.removeItem("personal-finance-app-data")
      dispatch({ type: "CLEAR_ALL_DATA" })
      setShowConfirm(false)
    } else {
      setShowConfirm(true)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            Export Data
          </button>

          <label className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
            <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
            Import Data
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>
        </div>

        <div className="border-t pt-4">
          <button
            onClick={handleClearData}
            className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              showConfirm ? "bg-red-600 text-white hover:bg-red-700" : "bg-red-100 text-red-600 hover:bg-red-200"
            }`}
          >
            <TrashIcon className="w-5 h-5 mr-2" />
            {showConfirm ? "Confirm Clear All Data" : "Clear All Data"}
          </button>

          {showConfirm && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                ⚠️ This will permanently delete all your financial data. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowConfirm(false)}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          💾 Your data is automatically saved to your browser's local storage. Export regularly to create backups.
        </p>
      </div>
    </div>
  )
}
