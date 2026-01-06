"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NbaCard } from "@/components/ui/nba-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Sparkles, Filter, RefreshCw } from "lucide-react";
import { useState } from "react";

type FilterType = "all" | "scale" | "cut" | "optimize" | "maintain";

export default function ActionPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sample NBA recommendations - in production, this would come from an API
  const recommendations = [
    {
      title: "Increase Meta prospecting budget by 20%",
      status: "scale" as const,
      priority: 87,
      impact: "+$2,400 over 30 days",
      confidence: "High" as const,
      explanation: "This campaign is outperforming your account average and has headroom for additional spend without diminishing returns.",
      evidence: "ROAS 3.4 vs account avg 2.1 • CPA 20% below average",
    },
    {
      title: "Reduce Google Campaign X spend by 50%",
      status: "cut" as const,
      priority: 72,
      impact: "Save $1,200/month",
      confidence: "High" as const,
      explanation: "This campaign has consistently underperformed for 21 days. Consider reallocating budget to higher-performing channels.",
      evidence: "ROAS 0.8 • CPA 2.8× account average",
    },
    {
      title: "Optimize targeting for Facebook Retargeting",
      status: "optimize" as const,
      priority: 65,
      impact: "+$800 potential lift",
      confidence: "Medium" as const,
      explanation: "Campaign shows promise but targeting could be refined. Test narrower audience segments to improve conversion rate.",
      evidence: "CTR 2.1% (good) • CVR 0.8% (below avg 1.2%)",
    },
    {
      title: "Maintain Google Brand Search budget",
      status: "maintain" as const,
      priority: 58,
      impact: "Protect $3,200/mo revenue",
      confidence: "High" as const,
      explanation: "This campaign performs consistently at target metrics. No changes recommended at this time.",
      evidence: "ROAS 4.2 • CPA on target • Stable volume",
    },
    {
      title: "Scale LinkedIn Lead Gen by 30%",
      status: "scale" as const,
      priority: 79,
      impact: "+$1,800 over 30 days",
      confidence: "High" as const,
      explanation: "Strong performance with room to grow. Lead quality scores are above average and conversion rates are trending up.",
      evidence: "ROAS 3.8 • Lead quality score 8.5/10 • 15% MoM growth",
    },
    {
      title: "Pause Display Campaign - Low Performance",
      status: "cut" as const,
      priority: 84,
      impact: "Save $950/month",
      confidence: "High" as const,
      explanation: "Display campaign has failed to deliver conversions for 3 consecutive weeks. Recommend pausing and reallocating budget.",
      evidence: "0 conversions in 21 days • CPC 3× higher than average",
    },
  ];

  const filteredRecommendations = recommendations.filter(
    (rec) => filter === "all" || rec.status === filter
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const filterButtons: { label: string; value: FilterType; color: string }[] = [
    { label: "All", value: "all", color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
    { label: "Scale", value: "scale", color: "bg-success-50 text-success-700 hover:bg-success-100" },
    { label: "Optimize", value: "optimize", color: "bg-warning-50 text-warning-700 hover:bg-warning-100" },
    { label: "Cut", value: "cut", color: "bg-danger-50 text-danger-700 hover:bg-danger-100" },
    { label: "Maintain", value: "maintain", color: "bg-burgundy-50 text-burgundy-700 hover:bg-burgundy-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
                Next Best Actions
              </h1>
              <p className="text-lg text-gray-600">
                Your unfair advantage. AI-powered recommendations with expected profit impact.
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="gap-2"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {recommendations.length}
                  </p>
                  <p className="text-sm text-gray-600">Active Recommendations</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-burgundy-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-burgundy-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {recommendations.filter(r => r.confidence === "High").length}
                  </p>
                  <p className="text-sm text-gray-600">High Confidence</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-coral-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-coral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">$5,200</p>
                  <p className="text-sm text-gray-600">Potential Monthly Impact</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="w-4 h-4" />
              Filter:
            </div>
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === btn.value
                    ? btn.color + " ring-2 ring-offset-1 ring-current"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations Grid */}
        {filteredRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((rec, index) => (
              <NbaCard key={index} {...rec} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No recommendations</h3>
              <p className="text-gray-600">
                No {filter !== "all" && `"${filter}"`} recommendations at this time.
              </p>
              <Button
                variant="outline"
                onClick={() => setFilter("all")}
                className="mt-2"
              >
                View All Recommendations
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
