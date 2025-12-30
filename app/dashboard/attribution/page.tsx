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
  Sankey,
  Tooltip as SankeyTooltip,
} from "recharts";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type AttributionModel =
  | "last-touch"
  | "first-touch"
  | "linear"
  | "time-decay"
  | "position-based";

const ATTRIBUTION_MODELS: {
  value: AttributionModel;
  label: string;
  description: string;
}[] = [
  {
    value: "last-touch",
    label: "Last Touch",
    description: "100% credit to the final touchpoint before conversion",
  },
  {
    value: "first-touch",
    label: "First Touch",
    description: "100% credit to the first touchpoint in the journey",
  },
  {
    value: "linear",
    label: "Linear",
    description: "Equal credit distributed across all touchpoints",
  },
  {
    value: "time-decay",
    label: "Time Decay",
    description:
      "More credit to recent touchpoints (7-day exponential decay)",
  },
  {
    value: "position-based",
    label: "Position-Based",
    description: "40% first, 40% last, 20% distributed to middle touchpoints",
  },
];

export default function AttributionDashboard() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [selectedModel, setSelectedModel] =
    useState<AttributionModel>("time-decay");
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch attribution data
  const {
    data: attributionData,
    error: attributionError,
    mutate,
  } = useSWR(
    `/api/attribution/calculate?startDate=${startDate}&endDate=${endDate}&model=${selectedModel}`,
    fetcher,
    { refreshInterval: 120000 }
  );

  // Trigger recalculation
  const handleRecalculate = async () => {
    setIsCalculating(true);
    try {
      const response = await fetch("/api/attribution/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate, model: selectedModel }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate attribution");
      }

      // Refresh data
      await mutate();
    } catch (error) {
      console.error("Error calculating attribution:", error);
      alert("Failed to calculate attribution. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const loading = !attributionData && !attributionError;

  // Format data for bar chart
  const chartData = attributionData?.channels?.map((channel: any) => ({
    name: channel.channelName || channel.channelId,
    revenue: channel.revenue,
    bookings: channel.bookings,
  })) || [];

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Multi-Touch Attribution
          </h1>
          <p className="mt-2 text-gray-600">
            Understand the complete customer journey from first touch to
            conversion
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

            {/* Attribution Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attribution Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) =>
                  setSelectedModel(e.target.value as AttributionModel)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
              >
                {ATTRIBUTION_MODELS.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Model Description */}
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>
                {
                  ATTRIBUTION_MODELS.find((m) => m.value === selectedModel)
                    ?.label
                }
                :
              </strong>{" "}
              {
                ATTRIBUTION_MODELS.find((m) => m.value === selectedModel)
                  ?.description
              }
            </p>
          </div>

          {/* Recalculate Button */}
          <div className="mt-6">
            <button
              onClick={handleRecalculate}
              disabled={isCalculating}
              className="px-6 py-2 bg-burgundy-600 text-white rounded-md hover:bg-burgundy-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCalculating ? "Calculating..." : "Recalculate Attribution"}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading attribution data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {attributionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">
              Error Loading Data
            </h3>
            <p className="text-red-600">
              Failed to load attribution data. Please try again later.
            </p>
          </div>
        )}

        {/* Attribution Results */}
        {!loading && !attributionError && attributionData && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">
                  Total Revenue Attributed
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(attributionData.totalRevenue || 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">
                  Bookings Analyzed
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {attributionData.bookingsAttributed || 0}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">
                  Channels Involved
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {attributionData.channels?.length || 0}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">
                  Avg Touchpoints
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {(attributionData.avgTouchpoints || 0).toFixed(1)}
                </p>
              </div>
            </div>

            {/* Attribution Chart */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Revenue Attribution by Channel
              </h2>

              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#7C2D3A" name="Revenue ($)" />
                    <Bar
                      dataKey="bookings"
                      fill="#E57A63"
                      name="Bookings (#)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No attribution data available for this date range
                </div>
              )}
            </div>

            {/* Channel Attribution Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Channel Attribution Breakdown
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Channel
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bookings
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Weight
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        % of Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attributionData.channels?.map(
                      (channel: any, index: number) => {
                        const percentOfTotal = attributionData.totalRevenue > 0
                          ? (channel.revenue / attributionData.totalRevenue) *
                            100
                          : 0;

                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-medium text-gray-900">
                                {channel.channelName || channel.channelId}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                              ${channel.revenue.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                              {channel.bookings}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                              {(channel.avgWeight || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-burgundy-100 text-burgundy-800">
                                {percentOfTotal.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {attributionData.channels?.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No channel data available
                </div>
              )}
            </div>

            {/* Model Comparison Tip */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-yellow-900 font-semibold mb-2">
                💡 Attribution Model Tips
              </h3>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>
                  • <strong>First Touch</strong>: Best for top-of-funnel
                  campaigns focused on awareness
                </li>
                <li>
                  • <strong>Last Touch</strong>: Best for bottom-of-funnel
                  campaigns focused on conversion
                </li>
                <li>
                  • <strong>Linear</strong>: Best when all touchpoints are
                  equally important
                </li>
                <li>
                  • <strong>Time Decay</strong>: Best for longer sales cycles
                  where recent interactions matter more
                </li>
                <li>
                  • <strong>Position-Based</strong>: Best when both discovery
                  and conversion are critical
                </li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
