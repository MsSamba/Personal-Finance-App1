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
  transactions: [
    {
      id: "1",
      amount: -25.5,
      description: "Coffee Shop",
      category: "Food & Dining",
      date: "2024-01-15",
      type: "expense",
    },
    {
      id: "2",
      amount: 2500.0,
      description: "Salary",
      category: "Income",
      date: "2024-01-01",
      type: "income",
    },
  ],
  budgets: [
    { id: "1", category: "Food & Dining", limit: 500, spent: 145.5, color: "bg-blue-500" },
    { id: "2", category: "Transportation", limit: 200, spent: 45.0, color: "bg-green-500" },
  ],
  pots: [
    { id: "1", name: "Emergency Fund", target: 5000, saved: 2500, color: "bg-red-500" },
    { id: "2", name: "Vacation", target: 2000, saved: 750, color: "bg-yellow-500" },
  ],
  recurringBills: [
    { id: "1", name: "Netflix", amount: 15.99, dueDate: "2024-02-01", frequency: "monthly", paid: true },
    { id: "2", name: "Electricity", amount: 120.0, dueDate: "2024-02-05", frequency: "monthly", paid: false },
  ],
  balance: 4500.0,
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

function financeReducer(state, action) {
  let newState

  switch (action.type) {
    case "ADD_TRANSACTION":
      newState = {
        ...state,
        transactions: [action.payload, ...state.transactions],
        balance: state.balance + action.payload.amount,
      }
      break
    case "ADD_BUDGET":
      newState = {
        ...state,
        budgets: [...state.budgets, action.payload],
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
    case "ADD_RECURRING_BILL":
      newState = {
        ...state,
        recurringBills: [...state.recurringBills, action.payload],
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
    default:
      return state
  }

  saveToLocalStorage(newState)
  return newState
}

const FinanceContext = createContext()

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(financeReducer, getInitialState())

  return <FinanceContext.Provider value={{ state, dispatch }}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}
