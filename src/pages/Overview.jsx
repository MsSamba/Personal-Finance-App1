import { useFinance } from "../context/FinanceContext"
import { EmptyState } from "../components/EmptyState"
import { formatCurrency } from "../utils/currency"

export function Overview() {
  const { transactions, transactionSummary, transactionsLoading, balance } = useFinance()

  const recentTransactions = transactions.slice(0, 5)

  // Show welcome message if no data exists
  if (transactions.length === 0 && !transactionsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to FinanceFlow!</h1>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Take Control of Your Finances?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              You're just a few clicks away from transforming your financial life. Start by adding your first
              transaction, setting up a budget, or creating a savings goal. Every journey begins with a single step!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl mb-3">💳</div>
                <h3 className="font-semibold text-gray-900 mb-2">Add Your First Transaction</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Track your income and expenses to see where your money goes
                </p>
                <a
                  href="/transactions"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Add Transaction
                </a>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-semibold text-gray-900 mb-2">Create a Budget</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Set spending limits for different categories to stay on track
                </p>
                <a
                  href="/budgets"
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  Create Budget
                </a>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl mb-3">🏺</div>
                <h3 className="font-semibold text-gray-900 mb-2">Start Saving</h3>
                <p className="text-sm text-gray-600 mb-4">Set up savings goals and watch your money grow over time</p>
                <a
                  href="/pots"
                  className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                >
                  Create Savings Goal
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (transactionsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 text-white p-6 rounded-xl">
          <h3 className="text-sm font-medium text-gray-300">Current Balance</h3>
          <p className="text-3xl font-bold mt-2">{formatCurrency(balance)}</p>
          <p className="text-xs text-gray-400 mt-1">Calculated from {transactions.length} transactions</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Total Income</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(transactionSummary.total_income)}</p>
          <p className="text-xs text-gray-500 mt-1">From {transactionSummary.income_count} income transactions</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(transactionSummary.total_expenses)}</p>
          <p className="text-xs text-gray-500 mt-1">From {transactionSummary.expense_count} expense transactions</p>
        </div>
      </div>

      {recentTransactions.length > 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <a href="/transactions" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </a>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{transaction.category_icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.category_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.transaction_type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(Math.abs(transaction.signed_amount))}
                  </p>
                  <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <EmptyState
            icon="💳"
            title="No Transactions Yet"
            description="Start tracking your finances by adding your first transaction. Every shilling counts!"
            actionText="Add Your First Transaction"
            onAction={() => (window.location.href = "/transactions")}
          />
        </div>
      )}
    </div>
  )
}
