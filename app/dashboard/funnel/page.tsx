"use client";

import { useState } from "react";
import useSWR from "swr";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FunnelDashboard() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null
  );

  // Fetch funnel data
  const {
    data: funnelData,
    error: funnelError,
    isLoading: funnelLoading,
  } = useSWR(
    `/api/analytics/funnel?startDate=${startDate}&endDate=${endDate}${selectedChannelId ? `&channelId=${selectedChannelId}` : ""}`,
    fetcher,
    { refreshInterval: 60000 }
  );

  // Fetch channels for filter
  const { data: channelsData } = useSWR(
    "/api/integrations/channels",
    fetcher
  );

  const loading = funnelLoading;
  const stages = funnelData?.stages || [];

  // Find biggest drop-off
  const biggestDrop = stages.reduce(
    (max: any, stage: any, index: number) => {
      if (index === 0) return max;
      const dropRate = (1 - stage.conversionRate) * 100;
      if (dropRate > (max?.dropRate || 0)) {
        return {
          stage: stage.stage,
          previousStage: stages[index - 1].stage,
          dropRate,
          lostCount: stages[index - 1].count - stage.count,
        };
      }
      return max;
    },
    null
  );

  // Prepare data for bar chart
  const chartData = stages.map((stage: any, index: number) => ({
    stage: stage.stage,
    count: stage.count,
    fill:
      index === 0
        ? "#7C2D3A" // Burgundy for first
        : index === stages.length - 1
          ? "#4CAF50" // Green for last
          : "#E57A63", // Coral for middle
  }));

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Conversion Funnel Analysis
          </h1>
          <p className="mt-2 text-gray-600">
            Track customer progression from impression to paid invoice
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Channel Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channel Filter
              </label>
              <select
                value={selectedChannelId || ""}
                onChange={(e) =>
                  setSelectedChannelId(e.target.value || null)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
              >
                <option value="">All Channels</option>
                {channelsData?.channels?.map((channel: any) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading funnel data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {funnelError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">
              Error Loading Data
            </h3>
            <p className="text-red-600">
              Failed to load funnel data. Please try again later.
            </p>
          </div>
        )}

        {/* Funnel Results */}
        {!loading && !funnelError && funnelData && (
          <>
            {/* Overall Conversion Rate */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">
                  Overall Conversion Rate
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {(funnelData.overallConversionRate || 0).toFixed(2)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Impressions to Paid
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">
                  Total Impressions
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {(stages[0]?.count || 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">Paid Invoices</p>
                <p className="text-3xl font-bold text-green-600">
                  {(stages[stages.length - 1]?.count || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Biggest Leak Alert */}
            {biggestDrop && (
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
                      Biggest Leak Identified
                    </h3>
                    <p className="mt-2 text-sm text-red-700">
                      <strong>{biggestDrop.dropRate.toFixed(1)}%</strong> drop
                      from <strong>{biggestDrop.previousStage}</strong> to{" "}
                      <strong>{biggestDrop.stage}</strong> (
                      {biggestDrop.lostCount.toLocaleString()} lost)
                    </p>
                    <p className="mt-2 text-sm text-red-600">
                      💡 Focus on improving conversion at this stage to capture
                      more revenue.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Funnel Visualization */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Conversion Funnel Stages
              </h2>

              {/* Visual Funnel */}
              <div className="space-y-4 mb-8">
                {stages.map((stage: any, index: number) => {
                  const widthPercentage = stages[0].count > 0
                    ? (stage.count / stages[0].count) * 100
                    : 0;

                  const previousStage = index > 0 ? stages[index - 1] : null;
                  const dropRate = previousStage
                    ? ((previousStage.count - stage.count) /
                        previousStage.count) *
                      100
                    : 0;

                  return (
                    <div key={stage.stage}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-semibold text-gray-900">
                            {index + 1}. {stage.stage}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({stage.count.toLocaleString()})
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-700">
                            {(stage.conversionRate * 100).toFixed(1)}%
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            conversion
                          </span>
                        </div>
                      </div>

                      {/* Funnel Bar */}
                      <div className="relative bg-gray-100 rounded-lg overflow-hidden h-12">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-burgundy-600 to-burgundy-500 flex items-center justify-center text-white text-sm font-medium"
                          style={{ width: `${Math.max(widthPercentage, 5)}%` }}
                        >
                          {widthPercentage.toFixed(1)}%
                        </div>
                      </div>

                      {/* Drop-off indicator */}
                      {index < stages.length - 1 && dropRate > 0 && (
                        <div className="mt-2 text-center">
                          <span
                            className={`inline-flex items-center text-xs px-2 py-1 rounded ${
                              dropRate > 50
                                ? "bg-red-100 text-red-700"
                                : dropRate > 25
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            ↓ {dropRate.toFixed(1)}% drop-off
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bar Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => value.toLocaleString()}
                  />
                  <Bar dataKey="count" name="Count">
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stage Details Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Stage Details
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stage
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Count
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stage Conversion
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Drop From Previous
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        % of Initial
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stages.map((stage: any, index: number) => {
                      const previousStage =
                        index > 0 ? stages[index - 1] : null;
                      const dropCount = previousStage
                        ? previousStage.count - stage.count
                        : 0;
                      const dropRate = previousStage
                        ? (dropCount / previousStage.count) * 100
                        : 0;
                      const percentOfInitial = stages[0].count > 0
                        ? (stage.count / stages[0].count) * 100
                        : 0;

                      return (
                        <tr key={stage.stage} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-medium text-gray-900">
                              {stage.stage}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                            {stage.count.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {(stage.conversionRate * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {previousStage ? (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  dropRate > 50
                                    ? "bg-red-100 text-red-800"
                                    : dropRate > 25
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {dropRate.toFixed(1)}% (-
                                {dropCount.toLocaleString()})
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                            {percentOfInitial.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Optimization Tips */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-blue-900 font-semibold mb-3">
                💡 Funnel Optimization Tips
              </h3>
              <ul className="text-blue-800 text-sm space-y-2">
                <li>
                  • <strong>High Click-to-Call Drop:</strong> Improve landing
                  page clarity and add prominent call-to-action
                </li>
                <li>
                  • <strong>High Call-to-Booking Drop:</strong> Train staff on
                  booking conversion, reduce friction in scheduling
                </li>
                <li>
                  • <strong>High Booking-to-Completion Drop:</strong> Send
                  appointment reminders, reduce no-shows
                </li>
                <li>
                  • <strong>High Completion-to-Paid Drop:</strong> Simplify
                  payment process, offer multiple payment methods
                </li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
