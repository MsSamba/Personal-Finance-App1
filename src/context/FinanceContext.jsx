"use client"

import { createContext, useReducer, useContext, useEffect, useCallback, useState, useMemo } from "react"
import { useAuth } from "./AuthContext"
import { transactionAPI, budgetAPI, savingsAPI, recurringBillsAPI } from "../config/api"

// -----------------------------
// Initial State
// -----------------------------
const initialState = {
  transactions: [],
  budgets: [],
  budgetCategories: [],
  budgetAnalytics: null,
  transactionCategories: [],
  pots: [],
  recurringBills: [],
  recurringBillStats: null,

  // Savings
  savingsAccount: null,
  savingsGoals: [],
  savingsSettings: null,
  savingsTransactions: [],
  savingsAnalytics: null,

  // Loading states
  loading: false,
  savingsLoading: false,
  savingsAnalyticsLoading: false,

  // Error handling
  error: null,
}

// -----------------------------
// Reducer
// -----------------------------
function financeReducer(state, action) {
  switch (action.type) {
    // Global
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "CLEAR_ERROR":
      return { ...state, error: null }

    // Transactions
    case "SET_TRANSACTIONS":
      return { ...state, transactions: Array.isArray(action.payload) ? action.payload : [] }
    case "ADD_TRANSACTION":
      return { ...state, transactions: [action.payload, ...(state.transactions || [])] }
    case "SET_TRANSACTION_CATEGORIES":
      return {
        ...state,
        transactionCategories: Array.isArray(action.payload) ? action.payload : [],
        budgetCategories: Array.isArray(action.payload) ? action.payload : [],
      }
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: (state.transactions || []).map((tx) => (tx.id === action.payload.id ? action.payload : tx)),
      }
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: (state.transactions || []).filter((tx) => tx.id !== action.payload),
      }

    // Budgets
    case "SET_BUDGETS":
      return { ...state, budgets: Array.isArray(action.payload) ? action.payload : [] }
    case "ADD_BUDGET":
      return { ...state, budgets: [action.payload, ...(state.budgets || [])] }
    case "UPDATE_BUDGET":
      return {
        ...state,
        budgets: (state.budgets || []).map((b) => (b.id === action.payload.id ? action.payload : b)),
      }
    case "DELETE_BUDGET":
      return {
        ...state,
        budgets: (state.budgets || []).filter((b) => b.id !== action.payload),
      }

    case "SET_BUDGET_ANALYTICS":
      return { ...state, budgetAnalytics: action.payload }

    // Pots
    case "SET_POTS":
      return { ...state, pots: Array.isArray(action.payload) ? action.payload : [] }

    // Recurring Bills
    case "SET_RECURRING_BILLS":
      return { ...state, recurringBills: Array.isArray(action.payload) ? action.payload : [] }
    case "ADD_RECURRING_BILL":
      return { ...state, recurringBills: [action.payload, ...(state.recurringBills || [])] }
    case "UPDATE_RECURRING_BILL":
      return {
        ...state,
        recurringBills: (state.recurringBills || []).map((bill) =>
          bill.id === action.payload.id ? action.payload : bill,
        ),
      }
    case "DELETE_RECURRING_BILL":
      return {
        ...state,
        recurringBills: (state.recurringBills || []).filter((bill) => bill.id !== action.payload),
      }
    case "TOGGLE_BILL_PAID":
      return {
        ...state,
        recurringBills: (state.recurringBills || []).map((bill) =>
          bill.id === action.payload ? { ...bill, paid: !bill.paid } : bill,
        ),
      }
    case "MARK_ALL_BILLS_PAID":
      return {
        ...state,
        recurringBills: (state.recurringBills || []).map((bill) => ({ ...bill, paid: true })),
      }
    case "RESET_ALL_BILLS":
      return {
        ...state,
        recurringBills: (state.recurringBills || []).map((bill) => ({ ...bill, paid: false })),
      }

    case "SET_RECURRING_BILL_STATS":
      return { ...state, recurringBillStats: action.payload }
  

    // Savings
    case "SET_SAVINGS_ACCOUNT":
      return { ...state, savingsAccount: action.payload }
    case "SET_SAVINGS_GOALS":
      return { ...state, savingsGoals: Array.isArray(action.payload) ? action.payload : [] }
    case "ADD_SAVINGS_GOAL":
      return { ...state, savingsGoals: [action.payload, ...(state.savingsGoals || [])] }
    case "UPDATE_SAVINGS_GOAL":
      return {
        ...state,
        savingsGoals: (state.savingsGoals || []).map((g) => (g.id === action.payload.id ? action.payload : g)),
      }
    case "DELETE_SAVINGS_GOAL":
      return {
        ...state,
        savingsGoals: (state.savingsGoals || []).filter((g) => g.id !== action.payload),
      }
    case "SET_SAVINGS_LOADING":
      return { ...state, savingsLoading: action.payload }
    case "SET_SAVINGS_TRANSACTIONS":
      return { ...state, savingsTransactions: Array.isArray(action.payload) ? action.payload : [] }
    case "SET_SAVINGS_ANALYTICS":
      return { ...state, savingsAnalytics: action.payload }
    case "SET_SAVINGS_SETTINGS":
      return { ...state, savingsSettings: action.payload }
    case "SET_SAVINGS_ANALYTICS_LOADING":
      return { ...state, savingsAnalyticsLoading: action.payload }

    default:
      return state
  }
}

// -----------------------------
// Context
// -----------------------------
const FinanceContext = createContext()

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(financeReducer, initialState)
  const { currentUser } = useAuth()
  const [transactionsLoading, setTransactionsLoading] = useState(false)

  // Function to clear error
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" })
  }, [])

  // -----------------------------
  // Derived State: Expense Categories
  // -----------------------------
  const expenseCategories = useMemo(() => {
    if (!state.budgetCategories) return []
    return state.budgetCategories.filter((c) => !c.is_income_category)
  }, [state.budgetCategories])

  // -----------------------------
  // Transaction API Functions
  // -----------------------------
  const fetchTransactions = useCallback(
    async (params = {}) => {
      if (!currentUser) return
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        const res = await transactionAPI.getTransactions(params)
        dispatch({ type: "SET_TRANSACTIONS", payload: res.data.results || res.data })
      } catch (error) {
        console.error("Error fetching transactions:", error)
        dispatch({ type: "SET_ERROR", payload: "Failed to load transactions" })
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    [currentUser],
  )

  const fetchTransactionsWithLoading = useCallback(
    async (params = {}) => {
      if (!currentUser) return
      try {
        setTransactionsLoading(true)
        dispatch({ type: "CLEAR_ERROR" })
        const res = await transactionAPI.getTransactions(params)
        dispatch({ type: "SET_TRANSACTIONS", payload: res.data.results || res.data })
      } catch (error) {
        console.error("Error fetching transactions:", error)
        dispatch({ type: "SET_ERROR", payload: "Failed to load transactions" })
      } finally {
        setTransactionsLoading(false)
      }
    },
    [currentUser],
  )

  const createTransaction = useCallback(async (txData) => {
    try {
      const res = await transactionAPI.createTransaction(txData)
      dispatch({ type: "ADD_TRANSACTION", payload: res.data })
      return res.data
    } catch (error) {
      console.error("Error creating transaction:", error)
      throw error
    }
  }, [])

  const fetchTransactionCategories = useCallback(async () => {
    if (!currentUser) return
    try {
      const res = await transactionAPI.getCategories()
      dispatch({ type: "SET_TRANSACTION_CATEGORIES", payload: res.data.results || res.data })
    } catch (error) {
      console.error("Error fetching transaction categories:", error)
      dispatch({ type: "SET_TRANSACTION_CATEGORIES", payload: [] })
    }
  }, [currentUser])

  const updateTransaction = useCallback(async (id, txData) => {
    try {
      const res = await transactionAPI.updateTransaction(id, txData)
      dispatch({ type: "UPDATE_TRANSACTION", payload: res.data })
      return res.data
    } catch (error) {
      console.error("Error updating transaction:", error)
      throw error
    }
  }, [])

  const deleteTransaction = useCallback(async (id) => {
    try {
      await transactionAPI.deleteTransaction(id)
      dispatch({ type: "DELETE_TRANSACTION", payload: id })
    } catch (error) {
      console.error("Error deleting transaction:", error)
      throw error
    }
  }, [])

  // -----------------------------
  // Derived State: Transaction Summary
  // -----------------------------
  const incomeTxs = state.transactions.filter((tx) => tx.type === "income")
  const expenseTxs = state.transactions.filter((tx) => tx.type === "expense")

  const transactionSummary = {
    total_income: incomeTxs.reduce((sum, tx) => sum + Number.parseFloat(tx.amount), 0),
    total_expenses: expenseTxs.reduce((sum, tx) => sum + Number.parseFloat(tx.amount), 0),
    income_count: incomeTxs.length,
    expense_count: expenseTxs.length,
  }

  const balance = state.transactions.reduce((sum, tx) => sum + Number.parseFloat(tx.signed_amount), 0)

  // -----------------------------
  // Budget API Functions
  // -----------------------------
  const fetchBudgets = useCallback(async () => {
    if (!currentUser) return
    try {
      const res = await budgetAPI.getBudgets()
      const data = res.data.results || res.data
      dispatch({ type: "SET_BUDGETS", payload: data })
    } catch (error) {
      console.error("Error fetching budgets:", error)
      dispatch({ type: "SET_BUDGETS", payload: [] })
    }
  }, [currentUser])

  const createBudget = useCallback(async (budgetData) => {
    try {
      console.log("Submitting budget data:", budgetData)
      const res = await budgetAPI.createBudget(budgetData)
      dispatch({ type: "ADD_BUDGET", payload: res.data })
      return res.data
    } catch (error) {
      console.error("Error creating budget:", error.response?.data || error.message)
      throw error
    }
  }, [])

  const updateBudget = useCallback(async (id, budgetData) => {
    try {
      const res = await budgetAPI.updateBudget(id, budgetData)
      dispatch({ type: "UPDATE_BUDGET", payload: res.data })
      return res.data
    } catch (error) {
      console.error("Error updating budget:", error)
      throw error
    }
  }, [])

  const deleteBudget = useCallback(async (id) => {
    try {
      await budgetAPI.deleteBudget(id)
      dispatch({ type: "DELETE_BUDGET", payload: id })
    } catch (error) {
      console.error("Error deleting budget:", error)
      throw error
    }
  }, [])

  const fetchBudgetAnalytics = useCallback(
    async ({ period = "current" } = {}) => {
      dispatch({ type: "SET_SAVINGS_ANALYTICS_LOADING", payload: true })
      try {
        const res = await budgetAPI.getBudgetAnalytics(period)
        dispatch({ type: "SET_BUDGET_ANALYTICS", payload: res.data })
      } catch (err) {
        console.error("Error fetching budget analytics:", err)
        dispatch({ type: "SET_BUDGET_ANALYTICS", payload: null })
      } finally {
        dispatch({ type: "SET_SAVINGS_ANALYTICS_LOADING", payload: false })
      }
    },
    [currentUser],
  )

  // -----------------------------
  // Savings API Functions
  // -----------------------------
  const fetchSavingsAccount = useCallback(async () => {
    if (!currentUser) return
    try {
      const res = await savingsAPI.getSavingsAccount()
      dispatch({ type: "SET_SAVINGS_ACCOUNT", payload: res.data })
    } catch (error) {
      console.error("Error fetching savings account:", error)
    }
  }, [currentUser])

  const fetchSavingsGoals = useCallback(async () => {
    if (!currentUser) return
    try {
      dispatch({ type: "SET_SAVINGS_LOADING", payload: true })
      const res = await savingsAPI.getSavingsGoals()
      dispatch({ type: "SET_SAVINGS_GOALS", payload: res.data.results || res.data })
    } catch (error) {
      console.error("Error fetching savings goals:", error)
    } finally {
      dispatch({ type: "SET_SAVINGS_LOADING", payload: false })
    }
  }, [currentUser])

  const createSavingsGoal = useCallback(async (goalData) => {
    try {
      const res = await savingsAPI.createSavingsGoal(goalData)
      dispatch({ type: "ADD_SAVINGS_GOAL", payload: res.data })
      fetchSavingsAnalytics()
      return res.data
    } catch (error) {
      console.error("Error creating savings goal:", error)
      dispatch({ type: "SET_ERROR", payload: error.response?.data?.error || "Failed to create savings goal" })
      throw error
    }
  }, [])

  const addFundsToGoal = useCallback(async (id, data) => {
    try {
      const res = await savingsAPI.addFundsToGoal(id, data)
      dispatch({ type: "UPDATE_SAVINGS_GOAL", payload: res.data.goal })
      await fetchSavingsAccount()
      return res.data
    } catch (error) {
      console.error("Error adding funds:", error.response?.data || error.message)
      dispatch({ type: "SET_ERROR", payload: error.response?.data?.error || "Failed to add funds to goal" })
      throw error
    }
  }, [])

  const withdrawFromGoal = useCallback(async (id, data) => {
    try {
      const res = await savingsAPI.withdrawFundsFromGoal(id, data)
      dispatch({ type: "UPDATE_SAVINGS_GOAL", payload: res.data.goal })
      await fetchSavingsAccount()
      return res.data
    } catch (error) {
      console.error("Error withdrawing funds:", error.response?.data || error.message)
      dispatch({ type: "SET_ERROR", payload: error.response?.data?.error || "Failed to withdraw funds from goal" })
      throw error
    }
  }, [])

  const allocateToGoal = useCallback(async (data) => {
    try {
      const res = await savingsAPI.allocateToGoal(data)
      await Promise.all([fetchSavingsAccount(), fetchSavingsGoals()])
      return res.data
    } catch (error) {
      console.error("Error allocating funds:", error.response?.data || error.message)
      dispatch({ type: "SET_ERROR", payload: error.response?.data?.error || "Failed to allocate funds to goal" })
      throw error
    }
  }, [])

  const updateSavingsGoal = useCallback(async (id, goalData) => {
    try {
      const res = await savingsAPI.updateSavingsGoal(id, goalData)
      dispatch({ type: "UPDATE_SAVINGS_GOAL", payload: res.data })
      fetchSavingsAnalytics()
      return res.data
    } catch (error) {
      console.error("Error updating savings goal:", error)
      dispatch({ type: "SET_ERROR", payload: error.response?.data?.error || "Failed to update savings goal" })
      throw error
    }
  }, [])

  const deleteSavingsGoal = useCallback(async (id) => {
    try {
      await savingsAPI.deleteSavingsGoal(id)
      dispatch({ type: "DELETE_SAVINGS_GOAL", payload: id })
      fetchSavingsAnalytics()
      fetchSavingsAccount()
    } catch (error) {
      console.error("Error deleting savings goal:", error)
      dispatch({ type: "SET_ERROR", payload: error.response?.data?.error || "Failed to delete savings goal" })
      throw error
    }
  }, [])

  const fetchSavingsAnalytics = useCallback(async () => {
    if (!currentUser) return
    try {
      dispatch({ type: "SET_SAVINGS_ANALYTICS_LOADING", payload: true })
      const res = await savingsAPI.getSavingsAnalytics()
      dispatch({ type: "SET_SAVINGS_ANALYTICS", payload: res.data })
    } catch (error) {
      console.error("Error fetching savings analytics:", error)
    } finally {
      dispatch({ type: "SET_SAVINGS_ANALYTICS_LOADING", payload: false })
    }
  }, [currentUser])

  // -----------------------------
  // Recurring Bills API Functions
  // -----------------------------
  const fetchRecurringBills = useCallback(async () => {
  if (!currentUser) return
  try {

    dispatch({ type: "SET_LOADING", payload: true })
    const res = await recurringBillsAPI.getBills()
    console.log("📦 Recurring bills response:", res.data)

    // Handle both parts from backend
    const bills = Array.isArray(res.data.results?.results)
      ? res.data.results.results
      : []
    const stats = res.data.stats || null

    dispatch({ type: "SET_RECURRING_BILLS", payload: bills })
    if (stats) {
      dispatch({ type: "SET_RECURRING_BILL_STATS", payload: stats })
    }
  } catch (error) {
    console.error("Error fetching recurring bills:", error)
    dispatch({ type: "SET_ERROR", payload: "Failed to load recurring bills" })
  } finally {
    dispatch({ type: "SET_LOADING", payload: false })
  }
}, [currentUser])


  const createRecurringBill = useCallback(async (billData) => {
    try {
      const res = await recurringBillsAPI.createBill(billData)
      dispatch({ type: "ADD_RECURRING_BILL", payload: res.data })
      return res.data
    } catch (error) {
      console.error("Error creating recurring bill:", error)
      dispatch({ type: "SET_ERROR", payload: error.response?.data?.error || "Failed to create recurring bill" })
      throw error
    }
  }, [])

  const updateRecurringBill = useCallback(async (id, billData) => {
    try {
      const res = await recurringBillsAPI.updateBill(id, billData)
      dispatch({ type: "UPDATE_RECURRING_BILL", payload: res.data })
      return res.data
    } catch (error) {
      console.error("Error updating recurring bill:", error)
      dispatch({ type: "SET_ERROR", payload: error.response?.data?.error || "Failed to update recurring bill" })
      throw error
    }
  }, [])

  const deleteRecurringBill = useCallback(async (id) => {
    try {
      await recurringBillsAPI.deleteBill(id)
      dispatch({ type: "DELETE_RECURRING_BILL", payload: id })
    } catch (error) {
      console.error("Error deleting recurring bill:", error)
      dispatch({ type: "SET_ERROR", payload: error.response?.data?.error || "Failed to delete recurring bill" })
      throw error
    }
  }, [])

  const toggleBillPaid = useCallback(async (id) => {
    try {
      const res = await recurringBillsAPI.togglePaid(id)
      dispatch({ type: "UPDATE_RECURRING_BILL", payload: res.data })
      return res.data
    } catch (error) {
      console.error("Error toggling bill paid status:", error)
      dispatch({ type: "SET_ERROR", payload: error.response?.data?.error || "Failed to update bill status" })
      throw error
    }
  }, [])


  const markAllBillsPaid = useCallback(async () => {
  try {
    await recurringBillsAPI.bulkOperations({ action: "mark_all_paid" }) 
    await fetchRecurringBills() 
  } catch (error) {
    console.error("Error marking all bills paid:", error)
    dispatch({ type: "SET_ERROR", payload: error.response?.data?.error || "Failed to mark all bills paid" })
    throw error
  }
}, [fetchRecurringBills])

const resetAllBills = useCallback(async () => {
  try {
    await recurringBillsAPI.bulkOperations({ action: "reset_all" })
    await fetchRecurringBills()
  } catch (error) {
    console.error("Error resetting all bills:", error)
    dispatch({ type: "SET_ERROR", payload: error.response?.data?.error || "Failed to reset all bills" })
    throw error
  }
}, [fetchRecurringBills])


  // -----------------------------
  // Auto-load data on login
  // -----------------------------
  useEffect(() => {
    if (currentUser) {
      fetchTransactionsWithLoading()
      fetchBudgets()
      fetchTransactionCategories()
      fetchSavingsAccount()
      fetchSavingsGoals()
      fetchSavingsAnalytics()
      fetchRecurringBills()
    }
  }, [
    currentUser,
    fetchTransactionsWithLoading,
    fetchBudgets,
    fetchTransactionCategories,
    fetchSavingsAccount,
    fetchSavingsGoals,
    fetchSavingsAnalytics,
    fetchRecurringBills,
  ])

  // -----------------------------
  // Provider
  // -----------------------------
  return (
    <FinanceContext.Provider
      value={{
        ...state,
        transactionsLoading,

        // Derived values
        transactionSummary,
        balance,
        expenseCategories,

        // Transactions
        fetchTransactions: fetchTransactionsWithLoading,
        createTransaction,
        updateTransaction,
        deleteTransaction,

        // Budgets
        fetchBudgets,
        createBudget,
        updateBudget,
        deleteBudget,
        fetchBudgetAnalytics,

        // Transaction categories
        fetchTransactionCategories,

        // Savings
        fetchSavingsAccount,
        fetchSavingsGoals,
        createSavingsGoal,
        addFundsToGoal,
        withdrawFromGoal,
        allocateToGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        fetchSavingsAnalytics,

        // Recurring Bills
        fetchRecurringBills,
        createRecurringBill,
        updateRecurringBill,
        deleteRecurringBill,
        toggleBillPaid,
        markAllBillsPaid,
        resetAllBills,

        // Errors
        clearError,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

// Hook
export function useFinance() {
  return useContext(FinanceContext)
}

