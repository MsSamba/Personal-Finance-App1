"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp,
  Target,
  DollarSign,
  Calendar,
  Award,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react"
import { formatCurrency } from "../utils/currency"

const SavingsReport = ({ userId }) => {
  const [reportData, setReportData] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userId) {
      fetchReportData()
    }
  }, [userId, selectedPeriod])

  const fetchReportData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch multiple endpoints in parallel
      const [summaryRes, analyticsRes, insightsRes] = await Promise.all([
        fetch(`/api/savings/goals/summary/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`/api/savings/goals/analytics/?period=${selectedPeriod}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`/api/savings/insights/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }),
      ])

      if (!summaryRes.ok || !analyticsRes.ok || !insightsRes.ok) {
        throw new Error("Failed to fetch report data")
      }

      const [summary, analyticsData, insightsData] = await Promise.all([
        summaryRes.json(),
        analyticsRes.json(),
        insightsRes.json(),
      ])

      setReportData(summary)
      setAnalytics(analyticsData)
      setInsights(insightsData.insights || [])
    } catch (err) {
      setError(err.message)
      console.error("Error fetching report data:", err)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "high":
        return <ArrowUp className="h-4 w-4 text-orange-500" />
      case "medium":
        return <Info className="h-4 w-4 text-blue-500" />
      case "low":
        return <ArrowDown className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-50 border-red-200"
      case "positive":
        return "text-green-600 bg-green-50 border-green-200"
      case "suggestion":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Report</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchReportData} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!reportData || !analytics) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Savings Report</h2>
          <p className="text-gray-600">Comprehensive overview of your savings performance</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.total_balance)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+{analytics.savings_patterns.consistency_score.toFixed(1)}%</span>
              <span className="text-gray-500 ml-1">consistency</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Goals</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.goals.active}</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-gray-600">{analytics.progress.goals_on_track} on track</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Progress</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.progress.average_progress.toFixed(1)}%</p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${Math.min(analytics.progress.average_progress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Savings</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.savings_patterns.total_saved)}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-gray-600">{formatCurrency(analytics.savings_patterns.average_daily)}/day avg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      {insights.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Personalized Insights</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {insights.length} insight{insights.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)}`}>
                <div className="flex items-start space-x-3">
                  {getPriorityIcon(insight.priority)}
                  <div className="flex-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm mt-1">{insight.message}</p>
                    {insight.action_data && (
                      <div className="mt-2">
                        <button className="text-sm font-medium underline hover:no-underline">Take Action →</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals by Priority</h3>

          <div className="space-y-4">
            {Object.entries(analytics.goal_breakdown.by_priority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getPriorityIcon(priority)}
                  <span className="capitalize font-medium">{priority}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{count}</span>
                  <span className="text-sm text-gray-500">goals</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goal Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Status</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">On Track</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{analytics.goal_breakdown.by_status.on_track}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">At Risk</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{analytics.goal_breakdown.by_status.at_risk}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="font-medium">Behind</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{analytics.goal_breakdown.by_status.behind}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Savings Trend</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Best day:</span>
            <span className="font-medium">
              {analytics.savings_patterns.best_day ? formatCurrency(analytics.savings_patterns.best_day.amount) : "N/A"}
            </span>
          </div>
        </div>

        <div className="h-64 flex items-end space-x-1">
          {analytics.trends.daily_savings.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                style={{
                  height: `${Math.max((day.amount / Math.max(...analytics.trends.daily_savings.map((d) => d.amount))) * 200, 2)}px`,
                }}
                title={`${day.date}: ${formatCurrency(day.amount)}`}
              ></div>
              <div className="text-xs text-gray-500 mt-1 rotate-45 origin-left">
                {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predictions */}
      {analytics.predictions.estimated_completion_dates.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Completion Predictions</h3>

          <div className="space-y-4">
            {analytics.predictions.estimated_completion_dates.map((prediction, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{prediction.goal_name}</h4>
                  <p className="text-sm text-gray-600">
                    Estimated completion: {new Date(prediction.estimated_date).toLocaleDateString()}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm ${
                    prediction.confidence === "high"
                      ? "bg-green-100 text-green-800"
                      : prediction.confidence === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {prediction.confidence} confidence
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{analytics.goals.completed}</p>
            <p className="text-sm text-gray-600">Goals Completed</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{analytics.progress.completion_rate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Completion Rate</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(analytics.predictions.projected_monthly_savings)}
            </p>
            <p className="text-sm text-gray-600">Projected Monthly</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{analytics.predictions.goals_likely_to_complete}</p>
            <p className="text-sm text-gray-600">Goals on Target</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SavingsReport
