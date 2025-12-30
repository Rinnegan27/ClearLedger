"use client";

import { useState } from "react";
import useSWR from "swr";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const LEAD_QUALITY_COLORS: Record<string, string> = {
  hot: "#DC2626", // Red
  warm: "#F59E0B", // Amber
  cold: "#3B82F6", // Blue
  spam: "#6B7280", // Gray
};

const URGENCY_COLORS: Record<string, string> = {
  immediate: "#DC2626",
  soon: "#F59E0B",
  planning: "#3B82F6",
  browsing: "#6B7280",
};

export default function CallsDashboard() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Last 7 days
    return date.toISOString().split("T")[0];
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterQuality, setFilterQuality] = useState<string>("all");

  // Fetch calls data
  const {
    data: callsData,
    error: callsError,
    isLoading: callsLoading,
  } = useSWR(
    `/api/calls?startDate=${startDate}&endDate=${endDate}${filterStatus !== "all" ? `&status=${filterStatus}` : ""}${filterQuality !== "all" ? `&leadQuality=${filterQuality}` : ""}`,
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  const loading = callsLoading;
  const calls = callsData?.calls || [];
  const summary = callsData?.summary || {};

  // Prepare data for lead quality distribution
  const leadQualityData = Object.entries(
    summary.leadQualityDistribution || {}
  ).map(([quality, count]) => ({
    name: quality.charAt(0).toUpperCase() + quality.slice(1),
    value: count as number,
    color: LEAD_QUALITY_COLORS[quality] || "#6B7280",
  }));

  // Prepare data for urgency distribution
  const urgencyData = Object.entries(summary.urgencyDistribution || {}).map(
    ([urgency, count]) => ({
      name: urgency.charAt(0).toUpperCase() + urgency.slice(1),
      value: count as number,
      color: URGENCY_COLORS[urgency] || "#6B7280",
    })
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Call Intelligence & Lead Quality
          </h1>
          <p className="mt-2 text-gray-600">
            AI-powered call analysis and missed call recovery
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Call Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
              >
                <option value="all">All Calls</option>
                <option value="missed">Missed Only</option>
                <option value="answered">Answered Only</option>
              </select>
            </div>

            {/* Lead Quality Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lead Quality
              </label>
              <select
                value={filterQuality}
                onChange={(e) => setFilterQuality(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
              >
                <option value="all">All Qualities</option>
                <option value="hot">Hot Leads</option>
                <option value="warm">Warm Leads</option>
                <option value="cold">Cold Leads</option>
                <option value="spam">Spam</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading call data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {callsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">
              Error Loading Data
            </h3>
            <p className="text-red-600">
              Failed to load call data. Please try again later.
            </p>
          </div>
        )}

        {/* Call Data */}
        {!loading && !callsError && callsData && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">Total Calls</p>
                <p className="text-3xl font-bold text-gray-900">
                  {summary.totalCalls || 0}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">Missed Calls</p>
                <p className="text-3xl font-bold text-red-600">
                  {summary.missedCalls || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.totalCalls > 0
                    ? ((summary.missedCalls / summary.totalCalls) * 100).toFixed(
                        1
                      )
                    : 0}
                  % miss rate
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">Avg Lead Score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(summary.avgLeadScore || 0).toFixed(1)}
                  <span className="text-lg text-gray-500">/10</span>
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">
                  Estimated Lost Revenue
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  ${(summary.estimatedLostRevenue || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">From missed calls</p>
              </div>
            </div>

            {/* High-Value Missed Calls Alert */}
            {summary.highValueMissedCalls > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800">
                      High-Value Missed Calls Require Immediate Action
                    </h3>
                    <p className="mt-2 text-sm text-red-700">
                      You have <strong>{summary.highValueMissedCalls}</strong>{" "}
                      high-quality missed calls (lead score &gt; 7) worth
                      approximately{" "}
                      <strong>
                        ${summary.estimatedLostRevenue.toLocaleString()}
                      </strong>
                      . These leads are highly likely to convert if contacted
                      promptly.
                    </p>
                    <div className="mt-3">
                      <a
                        href="#missed-calls"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        View Missed Calls →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Lead Quality Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Lead Quality Distribution
                </h2>
                {leadQualityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={leadQualityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({
                          name,
                          percent,
                        }: {
                          name: string;
                          percent: number;
                        }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {leadQualityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No lead quality data available
                  </div>
                )}
              </div>

              {/* Urgency Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Call Urgency Distribution
                </h2>
                {urgencyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={urgencyData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({
                          name,
                          percent,
                        }: {
                          name: string;
                          percent: number;
                        }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {urgencyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No urgency data available
                  </div>
                )}
              </div>
            </div>

            {/* Calls List */}
            <div id="missed-calls" className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Call History
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {calls.length} calls found
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Caller
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lead Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quality
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Urgency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Est. Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {calls.map((call: any) => (
                      <tr
                        key={call.id}
                        className={`hover:bg-gray-50 ${
                          call.status === "missed" &&
                          call.leadScore > 7
                            ? "bg-red-50"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(call.callDate).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {call.callerName || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {call.phoneNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              call.status === "missed"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {call.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-bold text-gray-900">
                              {call.leadScore || 0}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">
                              /10
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                            style={{
                              backgroundColor:
                                LEAD_QUALITY_COLORS[call.leadQuality] + "20",
                              color: LEAD_QUALITY_COLORS[call.leadQuality],
                            }}
                          >
                            {call.leadQuality || "unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                            style={{
                              backgroundColor:
                                URGENCY_COLORS[call.urgency] + "20",
                              color: URGENCY_COLORS[call.urgency],
                            }}
                          >
                            {call.urgency || "unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(call.attributedValue || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <a
                            href={`tel:${call.phoneNumber}`}
                            className="text-burgundy-600 hover:text-burgundy-900 font-medium"
                          >
                            Call Back
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {calls.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No calls found for this date range
                </div>
              )}
            </div>

            {/* Call Recovery Tips */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-blue-900 font-semibold mb-3">
                📞 Missed Call Recovery Best Practices
              </h3>
              <ul className="text-blue-800 text-sm space-y-2">
                <li>
                  • <strong>Call back within 5 minutes:</strong> 80% of leads
                  convert if contacted immediately
                </li>
                <li>
                  • <strong>Prioritize by lead score:</strong> Focus on calls
                  with score &gt; 7 first
                </li>
                <li>
                  • <strong>Send SMS if no answer:</strong> Include booking link
                  and estimated pricing
                </li>
                <li>
                  • <strong>Try 3 times over 24 hours:</strong> Morning, lunch,
                  and evening attempts
                </li>
                <li>
                  • <strong>Log all callbacks:</strong> Track which leads
                  converted from missed calls
                </li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
