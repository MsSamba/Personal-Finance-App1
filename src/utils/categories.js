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
export const getCategoriesByType = (type, categories = []) => {
  if (type === "income") {
    // For income, only return the Income category
    return categories.filter((category) => category.is_income_category)
  }

  // For expenses, return all non-income categories
  return categories.filter((category) => !category.is_income_category)
}

// Helper function to get default category based on type
export const getDefaultCategory = (type, categories = []) => {
  if (type === "income") {
    const incomeCategory = categories.find((cat) => cat.is_income_category)
    return incomeCategory?.name || "Income"
  }

  // For expenses, return the first available expense category
  const expenseCategories = categories.filter((cat) => !cat.is_income_category)
  return expenseCategories[0]?.name || "Food and Dining"
}

// Category icons for visual enhancement (fallback if not from backend)
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
