"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Mail,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

export default function InsightsPage() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async (sendEmail: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/insights/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, sendEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate report");
      }

      setReport(data.report);

      if (sendEmail && data.emailSent) {
        alert("Report sent successfully via email!");
      } else if (sendEmail && !data.emailSent) {
        alert(`Failed to send email: ${data.emailError || "Unknown error"}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return {
      value: `${isPositive ? "+" : ""}${change.toFixed(1)}%`,
      color: isPositive ? "text-green-600" : "text-red-600",
      Icon: isPositive ? TrendingUp : TrendingDown,
    };
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "opportunity":
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
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
            <h1 className="text-3xl font-bold text-gray-900">Automated Insights</h1>
            <p className="text-gray-600 mt-2">
              Generate comprehensive marketing performance reports with AI-powered insights and recommendations.
            </p>
          </div>

        {/* Controls */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div className="flex gap-2">
                <Button
                  variant={period === "weekly" ? "default" : "outline"}
                  onClick={() => setPeriod("weekly")}
                  disabled={loading}
                >
                  Weekly Report
                </Button>
                <Button
                  variant={period === "monthly" ? "default" : "outline"}
                  onClick={() => setPeriod("monthly")}
                  disabled={loading}
                >
                  Monthly Report
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => generateReport(false)}
                disabled={loading}
              >
                <FileText className="w-4 h-4 mr-2" />
                {loading ? "Generating..." : "Generate Report"}
              </Button>
              <Button
                onClick={() => generateReport(true)}
                disabled={loading}
              >
                <Mail className="w-4 h-4 mr-2" />
                Generate & Email
              </Button>
            </div>
          </div>
        </Card>

        {/* Error */}
        {error && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </Card>
        )}

        {/* Report Display */}
        {report && (
          <div className="space-y-6">
            {/* Executive Summary */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Executive Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-lg border border-green-200">
                  <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(report.summary.totalRevenue)}
                  </div>
                  <div className={`text-sm font-medium mt-1 flex items-center gap-1 ${formatChange(report.comparison.revenueChange).color}`}>
                    {React.createElement(formatChange(report.comparison.revenueChange).Icon, { className: "w-4 h-4" })}
                    {formatChange(report.comparison.revenueChange).value}
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Total Spend</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(report.summary.totalSpend)}
                  </div>
                  <div className={`text-sm font-medium mt-1 flex items-center gap-1 ${formatChange(report.comparison.spendChange).color}`}>
                    {React.createElement(formatChange(report.comparison.spendChange).Icon, { className: "w-4 h-4" })}
                    {formatChange(report.comparison.spendChange).value}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">ROAS</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {report.summary.roas.toFixed(2)}x
                  </div>
                  <div className={`text-sm font-medium mt-1 flex items-center gap-1 ${formatChange(report.comparison.roasChange).color}`}>
                    {React.createElement(formatChange(report.comparison.roasChange).Icon, { className: "w-4 h-4" })}
                    {formatChange(report.comparison.roasChange).value}
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Bookings</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {report.summary.totalBookings}
                  </div>
                  <div className={`text-sm font-medium mt-1 flex items-center gap-1 ${formatChange(report.comparison.bookingsChange).color}`}>
                    {React.createElement(formatChange(report.comparison.bookingsChange).Icon, { className: "w-4 h-4" })}
                    {formatChange(report.comparison.bookingsChange).value}
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Calls</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {report.summary.totalCalls}
                  </div>
                  <div className={`text-sm font-medium mt-1 flex items-center gap-1 ${formatChange(report.comparison.callsChange).color}`}>
                    {React.createElement(formatChange(report.comparison.callsChange).Icon, { className: "w-4 h-4" })}
                    {formatChange(report.comparison.callsChange).value}
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Conversion Rate</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {report.summary.conversionRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500 mt-1">ROI: {report.summary.roi.toFixed(1)}%</div>
                </div>
              </div>
            </Card>

            {/* Top Performers */}
            {report.topChannels.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Top Performing Channels
                </h2>

                <div className="space-y-3">
                  {report.topChannels.map((channel: any, idx: number) => (
                    <div
                      key={channel.channelId}
                      className={`p-4 rounded-lg border-l-4 ${
                        idx === 0
                          ? "bg-yellow-50 border-yellow-400"
                          : "bg-gray-50 border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {idx + 1}. {channel.channelName}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Revenue: {formatCurrency(channel.revenue)} • Spend: {formatCurrency(channel.spend)} • Bookings: {channel.bookings}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {channel.roas.toFixed(2)}x
                          </div>
                          <div className="text-xs text-gray-500">ROAS</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Insights */}
            {report.insights.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Key Insights
                </h2>

                <div className="space-y-3">
                  {report.insights.map((insight: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start gap-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{insight.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{insight.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5" />
                  Recommendations
                </h2>

                <div className="space-y-4">
                  {report.recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="p-5 bg-white border-2 border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div className="font-semibold text-gray-900">{rec.title}</div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(rec.priority)}`}>
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
            )}
          </div>
        )}

        {/* Empty State */}
        {!report && !loading && (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Report Generated Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Click &quot;Generate Report&quot; to create your first insight report
            </p>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}
