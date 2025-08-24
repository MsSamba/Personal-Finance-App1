// Currency formatting utilities for Kenyan Shillings
export const formatCurrency = (amount) => {
  return `KES ${Math.abs(amount).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export const formatCurrencyWithSign = (amount) => {
  const sign = amount >= 0 ? "+" : ""
  return `${sign}KES ${Math.abs(amount).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export const CURRENCY_SYMBOL = "KES"
export const CURRENCY_CODE = "KES"
export const CURRENCY_NAME = "Kenyan Shilling"
