"use client"

import { createContext, useContext, useReducer, useEffect, useCallback } from "react"
import { transactionAPI } from "../config/api"
import { useAuth } from "./AuthContext"

const FinanceContext = createContext()

const initialState = {
  transactions: [],
  categories: [],
  budgets: [],
  pots: [],
  recurringBills: [],

  // Loading states
  transactionsLoading: false,
  categoriesLoading: false,

  // Summary data
  transactionSummary: {
    total_income: 0,
    total_expenses: 0,
    net_amount: 0,
    transaction_count: 0,
    income_count: 0,
    expense_count: 0,
  },

  // Error states
  error: null,
}

function financeReducer(state, action) {
  switch (action.type) {
    // Loading states
    case "SET_TRANSACTIONS_LOADING":
      return { ...state, transactionsLoading: action.payload }
    case "SET_CATEGORIES_LOADING":
      return { ...state, categoriesLoading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "CLEAR_ERROR":
      return { ...state, error: null }

    // Transactions
    case "SET_TRANSACTIONS":
      return { ...state, transactions: action.payload }
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      }
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? action.payload : transaction,
        ),
      }
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((transaction) => transaction.id !== action.payload),
      }

    // Categories
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload }

    // Summary
    case "SET_TRANSACTION_SUMMARY":
      return { ...state, transactionSummary: action.payload }

    // Legacy localStorage actions (for budgets, pots, recurring bills)
    case "ADD_BUDGET":
      return { ...state, budgets: [...state.budgets, action.payload] }
    case "UPDATE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.map((budget) =>
          budget.id === action.payload.id ? { ...budget, ...action.payload.updates } : budget,
        ),
      }
    case "DELETE_BUDGET":
      return { ...state, budgets: state.budgets.filter((budget) => budget.id !== action.payload) }
    case "ADD_POT":
      return { ...state, pots: [...state.pots, action.payload] }
    case "UPDATE_POT":
      return {
        ...state,
        pots: state.pots.map((pot) => (pot.id === action.payload.id ? { ...pot, ...action.payload.updates } : pot)),
      }
    case "DELETE_POT":
      return { ...state, pots: state.pots.filter((pot) => pot.id !== action.payload) }
    case "ADD_RECURRING_BILL":
      return { ...state, recurringBills: [...state.recurringBills, action.payload] }
    case "UPDATE_RECURRING_BILL":
      return {
        ...state,
        recurringBills: state.recurringBills.map((bill) =>
          bill.id === action.payload.id ? { ...bill, ...action.payload.updates } : bill,
        ),
      }
    case "DELETE_RECURRING_BILL":
      return {
        ...state,
        recurringBills: state.recurringBills.filter((bill) => bill.id !== action.payload),
      }
    case "TOGGLE_BILL_PAID":
      return {
        ...state,
        recurringBills: state.recurringBills.map((bill) =>
          bill.id === action.payload ? { ...bill, paid: !bill.paid } : bill,
        ),
      }
    case "MARK_ALL_BILLS_PAID":
      return {
        ...state,
        recurringBills: state.recurringBills.map((bill) => ({ ...bill, paid: true })),
      }
    case "RESET_ALL_BILLS":
      return {
        ...state,
        recurringBills: state.recurringBills.map((bill) => ({ ...bill, paid: false })),
      }
    case "CLEAR_ALL_DATA":
      return initialState
    case "LOAD_LEGACY_DATA":
      return { ...state, ...action.payload }

    default:
      return state
  }
}

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(financeReducer, initialState)
  const { currentUser } = useAuth()

  // Load legacy data from localStorage for budgets, pots, and recurring bills
  useEffect(() => {
    if (currentUser) {
      try {
        const savedData = localStorage.getItem("personal-finance-app-data")
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          dispatch({
            type: "LOAD_LEGACY_DATA",
            payload: {
              budgets: parsedData.budgets || [],
              pots: parsedData.pots || [],
              recurringBills: parsedData.recurringBills || [],
            },
          })
        }
      } catch (error) {
        console.error("Error loading legacy data:", error)
      }
    }
  }, [currentUser])

  // Save legacy data to localStorage
  const saveLegacyData = useCallback(() => {
    try {
      const dataToSave = {
        budgets: state.budgets,
        pots: state.pots,
        recurringBills: state.recurringBills,
      }
      localStorage.setItem("personal-finance-app-data", JSON.stringify(dataToSave))
    } catch (error) {
      console.error("Error saving legacy data:", error)
    }
  }, [state.budgets, state.pots, state.recurringBills])

  // Save legacy data whenever it changes
  useEffect(() => {
    if (currentUser) {
      saveLegacyData()
    }
  }, [currentUser, saveLegacyData])

  // API Functions for Transactions
  const fetchTransactions = useCallback(
    async (params = {}) => {
      if (!currentUser) return

      try {
        dispatch({ type: "SET_TRANSACTIONS_LOADING", payload: true })
        dispatch({ type: "CLEAR_ERROR" })

        const response = await transactionAPI.getTransactions(params)
        dispatch({ type: "SET_TRANSACTIONS", payload: response.data.results || response.data })
      } catch (error) {
        console.error("Error fetching transactions:", error)
        dispatch({ type: "SET_ERROR", payload: "Failed to load transactions" })
      } finally {
        dispatch({ type: "SET_TRANSACTIONS_LOADING", payload: false })
      }
    },
    [currentUser],
  )

  const createTransaction = useCallback(async (transactionData) => {
    try {
      dispatch({ type: "CLEAR_ERROR" })
      const response = await transactionAPI.createTransaction(transactionData)
      dispatch({ type: "ADD_TRANSACTION", payload: response.data })

      // Refresh summary
      fetchTransactionSummary()

      return response.data
    } catch (error) {
      console.error("Error creating transaction:", error)
      const errorMessage = error.response?.data?.detail || "Failed to create transaction"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      throw error
    }
  }, [])

  const updateTransaction = useCallback(async (id, transactionData) => {
    try {
      dispatch({ type: "CLEAR_ERROR" })
      const response = await transactionAPI.updateTransaction(id, transactionData)
      dispatch({ type: "UPDATE_TRANSACTION", payload: response.data })

      // Refresh summary
      fetchTransactionSummary()

      return response.data
    } catch (error) {
      console.error("Error updating transaction:", error)
      const errorMessage = error.response?.data?.detail || "Failed to update transaction"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      throw error
    }
  }, [])

  const deleteTransaction = useCallback(async (id) => {
    try {
      dispatch({ type: "CLEAR_ERROR" })
      await transactionAPI.deleteTransaction(id)
      dispatch({ type: "DELETE_TRANSACTION", payload: id })

      // Refresh summary
      fetchTransactionSummary()
    } catch (error) {
      console.error("Error deleting transaction:", error)
      const errorMessage = error.response?.data?.detail || "Failed to delete transaction"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      throw error
    }
  }, [])

  // API Functions for Categories
  const fetchCategories = useCallback(
    async (params = {}) => {
      if (!currentUser) return

      try {
        dispatch({ type: "SET_CATEGORIES_LOADING", payload: true })
        dispatch({ type: "CLEAR_ERROR" })

        const response = await transactionAPI.getCategories(params)
        dispatch({ type: "SET_CATEGORIES", payload: response.data.results || response.data })
      } catch (error) {
        console.error("Error fetching categories:", error)
        dispatch({ type: "SET_ERROR", payload: "Failed to load categories" })
      } finally {
        dispatch({ type: "SET_CATEGORIES_LOADING", payload: false })
      }
    },
    [currentUser],
  )

  const createDefaultCategories = useCallback(async () => {
    try {
      dispatch({ type: "CLEAR_ERROR" })
      const response = await transactionAPI.createDefaultCategories()

      // Refresh categories
      fetchCategories()

      return response.data
    } catch (error) {
      console.error("Error creating default categories:", error)
      const errorMessage = error.response?.data?.detail || "Failed to create default categories"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      throw error
    }
  }, [fetchCategories])

  // Summary functions
  const fetchTransactionSummary = useCallback(
    async (params = {}) => {
      if (!currentUser) return

      try {
        const response = await transactionAPI.getTransactionSummary(params)
        dispatch({ type: "SET_TRANSACTION_SUMMARY", payload: response.data })
      } catch (error) {
        console.error("Error fetching transaction summary:", error)
      }
    },
    [currentUser],
  )

  // Initialize data when user logs in
  useEffect(() => {
    if (currentUser) {
      fetchTransactions()
      fetchCategories()
      fetchTransactionSummary()
    }
  }, [currentUser, fetchTransactions, fetchCategories, fetchTransactionSummary])

  // Calculate balance from transactions
  const balance = state.transactions.reduce((total, transaction) => {
    return total + Number.parseFloat(transaction.signed_amount || 0)
  }, 0)

  const value = {
    // State
    ...state,
    balance,

    // Transaction functions
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,

    // Category functions
    fetchCategories,
    createDefaultCategories,

    // Summary functions
    fetchTransactionSummary,

    // Legacy dispatch for budgets, pots, recurring bills
    dispatch,

    // Utility functions
    clearError: () => dispatch({ type: "CLEAR_ERROR" }),
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}
