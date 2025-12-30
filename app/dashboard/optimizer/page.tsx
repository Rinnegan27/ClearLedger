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

export default function BudgetOptimizerDashboard() {
  const [totalBudget, setTotalBudget] = useState(10000);
  const [minPerChannel, setMinPerChannel] = useState(500);
  const [maxPerChannel, setMaxPerChannel] = useState(5000);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedAllocations, setOptimizedAllocations] = useState<any[]>([]);
  const [manualAllocations, setManualAllocations] = useState<
    Record<string, number>
  >({});

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Fetch current channel performance
  const { data: performanceData, error: performanceError } = useSWR(
    `/api/analytics/revenue?startDate=${startDate}&endDate=${endDate}`,
    fetcher
  );

  const channels = performanceData?.channels || [];

  // Initialize manual allocations from current spend
  useState(() => {
    if (channels.length > 0 && Object.keys(manualAllocations).length === 0) {
      const initialAllocations: Record<string, number> = {};
      channels.forEach((channel: any) => {
        initialAllocations[channel.channelId] = channel.spend || 0;
      });
      setManualAllocations(initialAllocations);
    }
  });

  // Handle optimization
  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch("/api/optimizer/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalBudget,
          constraints: {
            minPerChannel,
            maxPerChannel,
          },
          objective: "maximize_roi",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to optimize budget");
      }

      const data = await response.json();
      setOptimizedAllocations(data.allocations || []);

      // Update manual allocations to match optimized
      const newManualAllocations: Record<string, number> = {};
      data.allocations?.forEach((alloc: any) => {
        newManualAllocations[alloc.channelId] = alloc.recommendedSpend;
      });
      setManualAllocations(newManualAllocations);
    } catch (error) {
      console.error("Error optimizing budget:", error);
      alert("Failed to optimize budget. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Update manual allocation
  const updateAllocation = (channelId: string, newSpend: number) => {
    setManualAllocations((prev) => ({
      ...prev,
      [channelId]: Math.max(
        minPerChannel,
        Math.min(maxPerChannel, newSpend)
      ),
    }));
  };

  // Calculate totals
  const currentTotalSpend = channels.reduce(
    (sum: number, ch: any) => sum + (ch.spend || 0),
    0
  );
  const proposedTotalSpend = Object.values(manualAllocations).reduce(
    (sum, spend) => sum + spend,
    0
  );

  // Prepare comparison chart data
  const comparisonData = optimizedAllocations.map((alloc: any) => {
    const channel = channels.find(
      (ch: any) => ch.channelId === alloc.channelId
    );
    return {
      name: alloc.channelName || alloc.channelId,
      current: channel?.spend || 0,
      recommended: alloc.recommendedSpend,
      manual: manualAllocations[alloc.channelId] || 0,
    };
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Budget Optimizer
          </h1>
          <p className="mt-2 text-gray-600">
            Optimize your marketing spend across channels to maximize ROI
          </p>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Optimization Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Monthly Budget ($)
              </label>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                min="0"
                step="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
              />
            </div>

            {/* Min per Channel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum per Channel ($)
              </label>
              <input
                type="number"
                value={minPerChannel}
                onChange={(e) => setMinPerChannel(Number(e.target.value))}
                min="0"
                step="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
              />
            </div>

            {/* Max per Channel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum per Channel ($)
              </label>
              <input
                type="number"
                value={maxPerChannel}
                onChange={(e) => setMaxPerChannel(Number(e.target.value))}
                min="0"
                step="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
              />
            </div>
          </div>

          {/* Historical Data Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Historical Data Start
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
                Historical Data End
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
              />
            </div>
          </div>

          <button
            onClick={handleOptimize}
            disabled={isOptimizing || channels.length === 0}
            className="px-6 py-3 bg-burgundy-600 text-white rounded-md hover:bg-burgundy-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isOptimizing ? "Optimizing..." : "Optimize Budget Allocation"}
          </button>
        </div>

        {/* Summary Stats */}
        {optimizedAllocations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Current Total Spend</p>
              <p className="text-2xl font-bold text-gray-900">
                ${currentTotalSpend.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Proposed Total Spend</p>
              <p className="text-2xl font-bold text-burgundy-600">
                ${proposedTotalSpend.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Budget Difference</p>
              <p
                className={`text-2xl font-bold ${
                  proposedTotalSpend - currentTotalSpend > 0
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                {proposedTotalSpend - currentTotalSpend > 0 ? "+" : ""}$
                {(proposedTotalSpend - currentTotalSpend).toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">
                Projected ROI Improvement
              </p>
              <p className="text-2xl font-bold text-green-600">
                +{optimizedAllocations[0]?.projectedROIIncrease || 0}%
              </p>
            </div>
          </div>
        )}

        {/* Comparison Chart */}
        {optimizedAllocations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Budget Allocation Comparison
            </h2>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="current" fill="#6B7280" name="Current Spend" />
                <Bar
                  dataKey="recommended"
                  fill="#7C2D3A"
                  name="AI Recommended"
                />
                <Bar dataKey="manual" fill="#E57A63" name="Your Allocation" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Channel Allocation Sliders */}
        {optimizedAllocations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Adjust Channel Allocations
            </h2>

            <div className="space-y-6">
              {optimizedAllocations.map((alloc: any) => {
                const channel = channels.find(
                  (ch: any) => ch.channelId === alloc.channelId
                );
                const currentSpend = channel?.spend || 0;
                const currentROI = channel?.roi || 0;
                const manualSpend = manualAllocations[alloc.channelId] || 0;
                const changeAmount = alloc.recommendedSpend - currentSpend;
                const changePercent =
                  currentSpend > 0 ? (changeAmount / currentSpend) * 100 : 0;

                return (
                  <div
                    key={alloc.channelId}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    {/* Channel Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {alloc.channelName || alloc.channelId}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Current ROI: {currentROI.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          AI Recommendation
                        </p>
                        <p className="text-lg font-bold text-burgundy-600">
                          ${alloc.recommendedSpend.toLocaleString()}
                        </p>
                        <p
                          className={`text-xs ${
                            changePercent > 0
                              ? "text-green-600"
                              : changePercent < 0
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {changePercent > 0 ? "+" : ""}
                          {changePercent.toFixed(1)}% change
                        </p>
                      </div>
                    </div>

                    {/* Slider */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          ${minPerChannel.toLocaleString()}
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          ${manualSpend.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-600">
                          ${maxPerChannel.toLocaleString()}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={minPerChannel}
                        max={maxPerChannel}
                        step="100"
                        value={manualSpend}
                        onChange={(e) =>
                          updateAllocation(
                            alloc.channelId,
                            Number(e.target.value)
                          )
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-burgundy-600"
                      />
                    </div>

                    {/* Reasoning */}
                    {alloc.reasoning && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Why this recommendation:</strong>{" "}
                          {alloc.reasoning}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total Validation */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Total Allocated:
                </span>
                <span
                  className={`text-lg font-bold ${
                    proposedTotalSpend === totalBudget
                      ? "text-green-600"
                      : proposedTotalSpend > totalBudget
                        ? "text-red-600"
                        : "text-orange-600"
                  }`}
                >
                  ${proposedTotalSpend.toLocaleString()} / $
                  {totalBudget.toLocaleString()}
                </span>
              </div>
              {proposedTotalSpend > totalBudget && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Total allocation exceeds budget. Reduce some channels.
                </p>
              )}
              {proposedTotalSpend < totalBudget && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ ${(totalBudget - proposedTotalSpend).toLocaleString()}{" "}
                  unallocated budget remaining.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {optimizedAllocations.length === 0 && !isOptimizing && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Optimization Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Configure your budget parameters above and click "Optimize Budget
              Allocation" to get AI-powered recommendations.
            </p>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-blue-900 font-semibold mb-3">
            🤖 How the AI Optimizer Works
          </h3>
          <ul className="text-blue-800 text-sm space-y-2">
            <li>
              • <strong>Historical Analysis:</strong> Analyzes past performance
              (ROI, bookings, conversion rates) for each channel
            </li>
            <li>
              • <strong>Diminishing Returns:</strong> Models decreasing ROI as
              spend increases (5% decay per $1,000)
            </li>
            <li>
              • <strong>Greedy Optimization:</strong> Allocates budget to
              channels with highest marginal ROI first
            </li>
            <li>
              • <strong>Constraint Respecting:</strong> Ensures all channels
              stay within min/max budget limits
            </li>
            <li>
              • <strong>Explainable AI:</strong> Provides reasoning for each
              recommendation based on data
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
