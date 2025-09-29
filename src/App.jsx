// "use client"

// import { useState } from "react"
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
// import { AuthProvider, useAuth } from "./context/AuthContext"
// import { FinanceProvider } from "./context/FinanceContext"
// import { AuthWrapper } from "./components/auth/AuthWrapper"
// import { ForgotPassword } from "./components/auth/ForgotPassword"
// import { ResetPassword } from "./components/auth/ResetPassword"
// import { EmailVerification } from "./components/auth/EmailVerification"
// import { Sidebar } from "./components/Sidebar"
// import { VerificationBanner } from "./components/VerificationBanner"
// import { Overview } from "./pages/Overview"
// import { Transactions } from "./pages/Transactions"
// import { Budgets } from "./pages/Budgets"
// import { Pots } from "./pages/Pots"
// import { RecurringBills } from "./pages/RecurringBills"

// function AppContent() {
//   const { currentUser, loading } = useAuth()
//   const [sidebarOpen, setSidebarOpen] = useState(false)

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="flex flex-col items-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <Router>
//       <Routes>
//         {/* Public routes */}
//         <Route path="/login" element={!currentUser ? <AuthWrapper /> : <Navigate to="/" replace />} />
//         <Route path="/register" element={!currentUser ? <AuthWrapper /> : <Navigate to="/" replace />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/reset-password" element={<ResetPassword />} />
//         <Route path="/verify-email" element={<EmailVerification />} />

//         {/* Protected routes */}
//         <Route
//           path="/*"
//           element={
//             currentUser ? (
//               <FinanceProvider>
//                 <div className="flex h-screen bg-gray-100">
//                   <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

//                   <div className="flex-1 flex flex-col overflow-hidden">
//                     <header className="bg-white shadow-sm border-b lg:hidden">
//                       <div className="flex items-center justify-between px-4 py-3">
//                         <h1 className="text-xl font-semibold text-gray-900">FinanceFlow</h1>
//                         <button
//                           onClick={() => setSidebarOpen(true)}
//                           className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
//                         >
//                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M4 6h16M4 12h16M4 18h16"
//                             />
//                           </svg>
//                         </button>
//                       </div>
//                     </header>

//                     <main className="flex-1 overflow-auto p-4 lg:p-8">
//                       <VerificationBanner />
//                       <Routes>
//                         <Route path="/" element={<Overview />} />
//                         <Route path="/transactions" element={<Transactions />} />
//                         <Route path="/budgets" element={<Budgets />} />
//                         <Route path="/pots" element={<Pots />} />
//                         <Route path="/recurring-bills" element={<RecurringBills />} />
//                         <Route path="*" element={<Navigate to="/" replace />} />
//                       </Routes>
//                     </main>
//                   </div>
//                 </div>
//               </FinanceProvider>
//             ) : (
//               <Navigate to="/login" replace />
//             )
//           }
//         />
//       </Routes>
//     </Router>
//   )
// }

// function App() {
//   return (
//     <AuthProvider>
//       <AppContent />
//     </AuthProvider>
//   )
// }

// export default App


"use client"

import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { FinanceProvider } from "./context/FinanceContext"
import { AuthWrapper } from "./components/auth/AuthWrapper"
import { ForgotPassword } from "./components/auth/ForgotPassword"
import { ResetPassword } from "./components/auth/ResetPassword"
import { EmailVerification } from "./components/auth/EmailVerification"
import { Sidebar } from "./components/Sidebar"
import { VerificationBanner } from "./components/VerificationBanner"
import { Overview } from "./pages/Overview"
import { Transactions } from "./pages/Transactions"
import { Budgets } from "./pages/Budgets"
import { Pots } from "./pages/Pots"
import { RecurringBills } from "./pages/RecurringBills"
import { Toaster } from "sonner"   // ✅ add this

function AppContent() {
  const { currentUser, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!currentUser ? <AuthWrapper /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!currentUser ? <AuthWrapper /> : <Navigate to="/" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<EmailVerification />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            currentUser ? (
              <FinanceProvider>
                <div className="flex h-screen bg-gray-100">
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                  <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="bg-white shadow-sm border-b lg:hidden">
                      <div className="flex items-center justify-between px-4 py-3">
                        <h1 className="text-xl font-semibold text-gray-900">FinanceFlow</h1>
                        <button
                          onClick={() => setSidebarOpen(true)}
                          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6h16M4 12h16M4 18h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </header>

                    <main className="flex-1 overflow-auto p-4 lg:p-8">
                      <VerificationBanner />
                      <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/budgets" element={<Budgets />} />
                        <Route path="/pots" element={<Pots />} />
                        <Route path="/recurring-bills" element={<RecurringBills />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                  </div>
                </div>
                <Toaster richColors position="top-right" /> {/* ✅ mount toaster */}
              </FinanceProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
