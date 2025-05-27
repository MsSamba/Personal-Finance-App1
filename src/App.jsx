"use client"

import { useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { FinanceProvider } from "./context/FinanceContext"
import { AuthWrapper } from "./components/auth/AuthWrapper"
import { Sidebar } from "./components/Sidebar"
import { Overview } from "./pages/Overview"
import { Transactions } from "./pages/Transactions"
import { Budgets } from "./pages/Budgets"
import { Pots } from "./pages/Pots"
import { RecurringBills } from "./pages/RecurringBills"

function AppContent() {
  const { currentUser, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!currentUser) {
    return <AuthWrapper />
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-semibold text-gray-900">Finance</h1>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/pots" element={<Pots />} />
            <Route path="/recurring-bills" element={<RecurringBills />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <Router>
          <AppContent />
        </Router>
      </FinanceProvider>
    </AuthProvider>
  )
}

export default App
