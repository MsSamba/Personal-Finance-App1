// Predetermined transaction categories arranged alphabetically
export const TRANSACTION_CATEGORIES = [
  "Bills and Utilities",
  "Education and Self Improvement",
  "Entertainment and Leisure",
  "Family and Kids",
  "Food and Dining",
  "Health and Wellness",
  "Income",
  "Savings and Investments",
  "Shopping and Personal Care",
  "Transportation",
]

// Helper function to get categories by type
export const getCategoriesByType = (type) => {
  if (type === "income") {
    return ["Income", "Savings and Investments"]
  }

  // For expenses, exclude Income category
  return TRANSACTION_CATEGORIES.filter((category) => category !== "Income")
}

// Helper function to get default category based on type
export const getDefaultCategory = (type) => {
  return type === "income" ? "Income" : "Food and Dining"
}

// Category icons for visual enhancement
export const CATEGORY_ICONS = {
  "Bills and Utilities": "🏠",
  "Education and Self Improvement": "📚",
  "Entertainment and Leisure": "🎬",
  "Family and Kids": "👨‍👩‍👧‍👦",
  "Food and Dining": "🍽️",
  "Health and Wellness": "🏥",
  Income: "💰",
  "Savings and Investments": "📈",
  "Shopping and Personal Care": "🛍️",
  Transportation: "🚗",
}
