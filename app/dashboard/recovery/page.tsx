"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PhoneOff,
  PhoneMissed,
  DollarSign,
  Clock,
  Calendar,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

export default function RecoveryPage() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/recovery/missed-calls?days=${days}`);
      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Failed to load missed call analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, [days]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Missed Call Recovery</h1>
            <p className="text-gray-600 mt-2">
              Track missed opportunities and recover lost revenue from unanswered calls
            </p>
          </div>

        {/* Controls */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div className="flex gap-2">
                <Button
                  variant={days === 7 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDays(7)}
                >
                  Last 7 Days
                </Button>
                <Button
                  variant={days === 30 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDays(30)}
                >
                  Last 30 Days
                </Button>
                <Button
                  variant={days === 90 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDays(90)}
                >
                  Last 90 Days
                </Button>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={loadAnalysis} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </Card>

        {loading ? (
          <Card className="p-12 text-center">
            <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Analyzing missed calls...</p>
          </Card>
        ) : analysis ? (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Missed Calls</p>
                    <p className="text-4xl font-bold text-gray-900">{analysis.missedCalls}</p>
                    <p className="text-sm text-red-600 font-medium mt-1">
                      {analysis.missedRate.toFixed(1)}% miss rate
                    </p>
                  </div>
                  <PhoneMissed className="w-8 h-8 text-red-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Calls</p>
                    <p className="text-4xl font-bold text-gray-900">{analysis.totalCalls}</p>
                    <p className="text-sm text-green-600 font-medium mt-1">
                      {analysis.answeredCalls} answered
                    </p>
                  </div>
                  <PhoneOff className="w-8 h-8 text-gray-400" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Est. Lost Revenue</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {formatCurrency(analysis.estimatedLostRevenue)}
                    </p>
                    <p className="text-sm text-orange-600 font-medium mt-1">
                      ~{analysis.estimatedLostBookings} bookings
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-orange-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg. Booking Value</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {formatCurrency(analysis.averageBookingValue)}
                    </p>
                    <p className="text-sm text-gray-600 font-medium mt-1">
                      {analysis.estimatedConversionRate.toFixed(1)}% conv. rate
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
              </Card>
            </div>

            {/* Peak Times */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Peak Missed Hours
                </h2>
                <div className="space-y-3">
                  {analysis.peakMissedHours.map((hour: any, idx: number) => (
                    <div
                      key={hour.hour}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        idx === 0 ? "bg-red-50 border border-red-200" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                        <span className="font-semibold text-gray-900">{hour.displayHour}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-red-600">{hour.missedCount}</div>
                        <div className="text-xs text-gray-500">missed</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Peak Missed Days
                </h2>
                <div className="space-y-3">
                  {analysis.peakMissedDays.map((day: any, idx: number) => (
                    <div
                      key={day.dayOfWeek}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        idx === 0 ? "bg-red-50 border border-red-200" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                        <span className="font-semibold text-gray-900">{day.dayName}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-red-600">{day.missedCount}</div>
                        <div className="text-xs text-gray-500">missed</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Recovery Recommendations
              </h2>
              <div className="space-y-4">
                {analysis.recommendations.map((rec: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 bg-white border-2 border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="font-semibold text-gray-900">{rec.title}</div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(rec.priority)}`}
                      >
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3 ml-11">{rec.description}</div>
                    <div className="ml-11 bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-green-800">
                        💰 {rec.expectedImpact}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Missed Calls */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <PhoneMissed className="w-5 h-5" />
                Recent Missed Calls
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Date/Time
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Phone Number
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Caller
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Channel
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Est. Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.recentMissedCalls.map((call: any) => (
                      <tr key={call.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {format(new Date(call.callDate), "MMM d, h:mm a")}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 font-mono">
                          {call.phoneNumber}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {call.callerName || "—"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {call.channelName || "—"}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                          {formatCurrency(call.estimatedValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-12 text-center">
            <PhoneMissed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">
              No call data found for the selected period
            </p>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}
