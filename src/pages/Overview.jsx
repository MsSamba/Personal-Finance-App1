import { useFinance } from "../context/FinanceContext"

export function Overview() {
  const { state } = useFinance()

  const totalIncome = state.transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = state.transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const recentTransactions = state.transactions.slice(0, 5)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 text-white p-6 rounded-xl">
          <h3 className="text-sm font-medium text-gray-300">Current Balance</h3>
          <p className="text-3xl font-bold mt-2">${state.balance.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Income</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">${totalIncome.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Expenses</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">${totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <p className="text-sm text-gray-500">{transaction.category}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                  {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">{transaction.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
