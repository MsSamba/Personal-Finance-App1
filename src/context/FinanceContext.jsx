"use client"

import { createContext, useContext, useReducer } from "react"

const STORAGE_KEY = "personal-finance-app-data"

const getInitialState = () => {
  if (typeof window === "undefined") {
    return getDefaultState()
  }

  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      return JSON.parse(savedData)
    }
  } catch (error) {
    console.error("Error loading data from localStorage:", error)
  }

  return getDefaultState()
}

const getDefaultState = () => ({
  transactions: [],
  budgets: [],
  pots: [],
  recurringBills: [],
})

const saveToLocalStorage = (state) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error("Error saving data to localStorage:", error)
    }
  }
}

const calculateBalance = (transactions) => {
  return transactions.reduce((total, transaction) => total + transaction.amount, 0)
}

function financeReducer(state, action) {
  let newState

  switch (action.type) {
    case "ADD_TRANSACTION":
      newState = {
        ...state,
        transactions: [action.payload, ...state.transactions],
      }
      break
    case "UPDATE_TRANSACTION":
      newState = {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? { ...transaction, ...action.payload.updates } : transaction,
        ),
      }
      break
    case "DELETE_TRANSACTION":
      newState = {
        ...state,
        transactions: state.transactions.filter((transaction) => transaction.id !== action.payload),
      }
      break
    case "ADD_BUDGET":
      newState = {
        ...state,
        budgets: [...state.budgets, action.payload],
      }
      break
    case "UPDATE_BUDGET":
      newState = {
        ...state,
        budgets: state.budgets.map((budget) =>
          budget.id === action.payload.id ? { ...budget, ...action.payload.updates } : budget,
        ),
      }
      break
    case "DELETE_BUDGET":
      newState = {
        ...state,
        budgets: state.budgets.filter((budget) => budget.id !== action.payload),
      }
      break
    case "ADD_POT":
      newState = {
        ...state,
        pots: [...state.pots, action.payload],
      }
      break
    case "UPDATE_POT":
      newState = {
        ...state,
        pots: state.pots.map((pot) => (pot.id === action.payload.id ? { ...pot, ...action.payload.updates } : pot)),
      }
      break
    case "DELETE_POT":
      newState = {
        ...state,
        pots: state.pots.filter((pot) => pot.id !== action.payload),
      }
      break
    case "ADD_RECURRING_BILL":
      newState = {
        ...state,
        recurringBills: [...state.recurringBills, action.payload],
      }
      break
    case "UPDATE_RECURRING_BILL":
      newState = {
        ...state,
        recurringBills: state.recurringBills.map((bill) =>
          bill.id === action.payload.id ? { ...bill, ...action.payload.updates } : bill,
        ),
      }
      break
    case "DELETE_RECURRING_BILL":
      newState = {
        ...state,
        recurringBills: state.recurringBills.filter((bill) => bill.id !== action.payload),
      }
      break
    case "TOGGLE_BILL_PAID":
      newState = {
        ...state,
        recurringBills: state.recurringBills.map((bill) =>
          bill.id === action.payload ? { ...bill, paid: !bill.paid } : bill,
        ),
      }
      break
    case "MARK_ALL_BILLS_PAID":
      newState = {
        ...state,
        recurringBills: state.recurringBills.map((bill) => ({ ...bill, paid: true })),
      }
      break
    case "RESET_ALL_BILLS":
      newState = {
        ...state,
        recurringBills: state.recurringBills.map((bill) => ({ ...bill, paid: false })),
      }
      break
    case "CLEAR_ALL_DATA":
      newState = getDefaultState()
      break
    default:
      return state
  }

  saveToLocalStorage(newState)
  return newState
}

const FinanceContext = createContext()

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(financeReducer, getInitialState())

  const balance = calculateBalance(state.transactions)

  return (
    <FinanceContext.Provider value={{ state: { ...state, balance }, dispatch }}>{children}</FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}
