"use client"

import { useState, useEffect } from "react"
import { useFinance } from "../context/FinanceContext"
import { formatCurrency } from "../utils/currency"
import { Doughnut, Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js"

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
)


export function BudgetAnalytics() {
  const { budgetAnalytics, budgetAnalyticsLoading, fetchBudgetAnalytics } = useFinance()
  const [selectedPeriod, setSelectedPeriod] = useState("current")

  useEffect(() => {
    fetchBudgetAnalytics({ period: selectedPeriod })
  }, [selectedPeriod, fetchBudgetAnalytics])

  if (budgetAnalyticsLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (!budgetAnalytics) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Budget Analytics</h3>
        <p className="text-gray-500">No analytics data available.</p>
      </div>
    )
  }

  const {
    total_budgets,
    total_budget_limit,
    total_spent,
    total_remaining,
    overall_percentage_used,
    budgets_on_track,
    budgets_at_risk,
    budgets_exceeded,
    average_performance_score,
    category_performance,
    period_comparison,
    recommendations,
  } = budgetAnalytics

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Budget Analytics</h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="current">Current Period</option>
            <option value="last_month">Last Month</option>
            <option value="last_quarter">Last Quarter</option>
            <option value="year_to_date">Year to Date</option>
          </select>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Budgets</p>
                <p className="text-2xl font-bold text-blue-900">{total_budgets}</p>
              </div>
              <div className="text-blue-500 text-2xl">📊</div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Limit</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(total_budget_limit)}</p>
              </div>
              <div className="text-green-500 text-2xl">💰</div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(total_spent)}</p>
              </div>
              <div className="text-orange-500 text-2xl">💸</div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Remaining</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(total_remaining)}</p>
              </div>
              <div className="text-purple-500 text-2xl">🎯</div>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Budget Usage</span>
            <span className="text-sm font-medium text-gray-900">{overall_percentage_used.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                overall_percentage_used >= 100
                  ? "bg-red-500"
                  : overall_percentage_used >= 80
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${Math.min(overall_percentage_used, 100)}%` }}
            />
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{budgets_on_track}</div>
            <div className="text-sm text-green-700">On Track</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{budgets_at_risk}</div>
            <div className="text-sm text-yellow-700">At Risk</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{budgets_exceeded}</div>
            <div className="text-sm text-red-700">Exceeded</div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Chart */}
{category_performance && category_performance.length > 0 && (
  <div className="bg-white p-6 rounded-xl shadow-sm border">
    <h4 className="text-lg font-semibold mb-4">Category Breakdown</h4>
    <Doughnut
      data={{
        labels: category_performance.map((c) => c.category),
        datasets: [
          {
            label: "Spent",
            data: category_performance.map((c) => c.spent),
            backgroundColor: category_performance.map((c) =>
              c.status === "exceeded"
                ? "#EF4444" // red
                : c.status === "at_risk"
                ? "#F59E0B" // yellow
                : "#10B981" // green
            ),
            borderWidth: 1,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
        },
      }}
    />
  </div>
)}


{/* Period Comparison Chart */}
{period_comparison && period_comparison.length > 0 && (
  <div className="bg-white p-6 rounded-xl shadow-sm border">
    <h4 className="text-lg font-semibold mb-4">Period Comparison</h4>
    <Bar
      data={{
        labels: period_comparison.map((p) => p.period),
        datasets: [
          {
            label: "Spent",
            data: period_comparison.map((p) => p.total_spent),
            backgroundColor: "#3B82F6",
          },
          {
            label: "Limit",
            data: period_comparison.map((p) => p.total_limit),
            backgroundColor: "#9CA3AF",
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
        },
      }}
    />
  </div>
)}


{/* Performance Trend */}
{period_comparison && period_comparison.length > 0 && (
  <div className="bg-white p-6 rounded-xl shadow-sm border">
    <h4 className="text-lg font-semibold mb-4">Performance Trend</h4>
    <Line
      data={{
        labels: period_comparison.map((p) => p.period),
        datasets: [
          {
            label: "Performance Score",
            data: period_comparison.map((p) => p.performance_score),
            borderColor: "#10B981",
            backgroundColor: "rgba(16,185,129,0.2)",
            fill: true,
            tension: 0.3,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
        },
        scales: {
          y: { min: 0, max: 100 },
        },
      }}
    />
  </div>
)}


      {/* Category Performance */}
      {category_performance && category_performance.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h4 className="text-lg font-semibold mb-4">Category Performance</h4>
          <div className="space-y-4">
            {category_performance.map((category, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${category.color}`} />
                    <span className="font-medium text-gray-900">{category.category}</span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        category.status === "exceeded"
                          ? "bg-red-100 text-red-800"
                          : category.status === "at_risk"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {category.status === "exceeded"
                        ? "Exceeded"
                        : category.status === "at_risk"
                          ? "At Risk"
                          : "On Track"}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(category.spent)} / {formatCurrency(category.limit)}
                    </div>
                    <div className="text-xs text-gray-500">{category.percentage_used.toFixed(1)}% used</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      category.status === "exceeded"
                        ? "bg-red-500"
                        : category.status === "at_risk"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(category.percentage_used, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      Period Comparison
      {period_comparison && period_comparison.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h4 className="text-lg font-semibold mb-4">Period Comparison</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-700">Period</th>
                  <th className="text-right py-2 font-medium text-gray-700">Limit</th>
                  <th className="text-right py-2 font-medium text-gray-700">Spent</th>
                  <th className="text-right py-2 font-medium text-gray-700">Usage %</th>
                  <th className="text-right py-2 font-medium text-gray-700">Score</th>
                </tr>
              </thead>
              <tbody>
                {period_comparison.map((period, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 font-medium text-gray-900">{period.period}</td>
                    <td className="py-2 text-right text-gray-700">{formatCurrency(period.total_limit)}</td>
                    <td className="py-2 text-right text-gray-700">{formatCurrency(period.total_spent)}</td>
                    <td className="py-2 text-right">
                      <span
                        className={`font-medium ${
                          period.percentage_used >= 100
                            ? "text-red-600"
                            : period.percentage_used >= 80
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {period.percentage_used.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <span className="font-medium text-blue-600">{period.performance_score.toFixed(0)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Score */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h4 className="text-lg font-semibold mb-4">Performance Score</h4>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Average Performance</span>
              <span className="text-lg font-bold text-blue-600">{average_performance_score.toFixed(0)}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${average_performance_score}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {average_performance_score >= 80
                ? "Excellent budget management!"
                : average_performance_score >= 60
                  ? "Good budget control"
                  : average_performance_score >= 40
                    ? "Room for improvement"
                    : "Consider reviewing your budgets"}
            </div>
          </div>
          <div className="text-4xl">
            {average_performance_score >= 80
              ? "🏆"
              : average_performance_score >= 60
                ? "👍"
                : average_performance_score >= 40
                  ? "⚠️"
                  : "📉"}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h4 className="text-lg font-semibold mb-4">💡 Recommendations</h4>
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-blue-500 mt-0.5">💡</div>
                <p className="text-sm text-blue-800">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
