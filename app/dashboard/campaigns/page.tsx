"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Filter,
} from "lucide-react";
import { CampaignScore, LetterGrade } from "@/lib/scoring/campaign-scorer";

export default function CampaignsPage() {
  const [scores, setScores] = useState<CampaignScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(1);
  const [gradeFilter, setGradeFilter] = useState<string>("all");

  const loadScores = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/campaigns/scores?months=${months}`);
      const data = await response.json();
      if (data.success) {
        setScores(data.scores);
      }
    } catch (error) {
      console.error("Failed to load campaign scores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScores();
  }, [months]);

  const getGradeColor = (grade: LetterGrade) => {
    const gradeBase = grade.charAt(0);
    switch (gradeBase) {
      case "A":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
          dot: "bg-green-500",
        };
      case "B":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          dot: "bg-blue-500",
        };
      case "C":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          border: "border-yellow-200",
          dot: "bg-yellow-500",
        };
      case "D":
        return {
          bg: "bg-orange-50",
          text: "text-orange-700",
          border: "border-orange-200",
          dot: "bg-orange-500",
        };
      case "F":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          dot: "bg-red-500",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          dot: "bg-gray-500",
        };
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    if (recommendation.includes("URGENT") || recommendation.includes("Pause")) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    if (recommendation.includes("Scale")) {
      return <TrendingUp className="w-5 h-5 text-green-500" />;
    }
    return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredScores = gradeFilter === "all"
    ? scores
    : scores.filter((s) => s.overallGrade.charAt(0) === gradeFilter);

  const gradeCounts = scores.reduce((acc, score) => {
    const base = score.overallGrade.charAt(0);
    acc[base] = (acc[base] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Campaign Report Card</h1>
            <p className="text-gray-600 mt-2">
              Performance grades for all campaigns based on ROAS, ROI, conversion rate, and volume
            </p>
          </div>

        {/* Controls */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <div className="flex gap-2">
                <Button
                  variant={months === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMonths(1)}
                >
                  Last Month
                </Button>
                <Button
                  variant={months === 3 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMonths(3)}
                >
                  Last 3 Months
                </Button>
                <Button
                  variant={months === 6 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMonths(6)}
                >
                  Last 6 Months
                </Button>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={loadScores} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </Card>

        {/* Grade Distribution */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {["A", "B", "C", "D", "F"].map((grade) => {
            const count = gradeCounts[grade] || 0;
            const colors = getGradeColor(grade as LetterGrade);
            const isActive = gradeFilter === grade;

            return (
              <Card
                key={grade}
                className={`p-4 cursor-pointer transition-all ${
                  isActive ? "ring-2 ring-indigo-500" : ""
                }`}
                onClick={() => setGradeFilter(isActive ? "all" : grade)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-3xl font-bold ${colors.text}`}>{grade}</div>
                    <div className="text-sm text-gray-500 mt-1">{count} campaigns</div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Campaign List */}
        {loading ? (
          <Card className="p-12 text-center">
            <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading campaign scores...</p>
          </Card>
        ) : filteredScores.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Campaigns Found</h3>
            <p className="text-gray-600">
              {gradeFilter === "all"
                ? "No campaign data available for the selected period"
                : `No campaigns with grade ${gradeFilter}`}
            </p>
            {gradeFilter !== "all" && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setGradeFilter("all")}
              >
                Show All Campaigns
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredScores.map((score, idx) => {
              const colors = getGradeColor(score.overallGrade);

              return (
                <Card key={score.campaignId} className="overflow-hidden">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold text-gray-400">#{idx + 1}</div>
                          {idx === 0 && (
                            <Trophy className="w-6 h-6 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {score.campaignName}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {score.channelName} • {score.bookings} bookings • {score.calls} calls
                          </p>
                        </div>
                      </div>

                      <div
                        className={`px-6 py-3 rounded-lg border-2 ${colors.bg} ${colors.border}`}
                      >
                        <div className={`text-4xl font-bold text-center ${colors.text}`}>
                          {score.overallGrade}
                        </div>
                        <div className="text-xs text-center text-gray-500 mt-1">
                          Score: {score.overallScore.toFixed(0)}
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-5 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">ROAS</div>
                        <div className="text-lg font-bold text-gray-900">
                          {score.roas.toFixed(2)}x
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Score: {score.componentScores.roasScore.toFixed(0)}
                        </div>
                      </div>

                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">ROI</div>
                        <div className="text-lg font-bold text-gray-900">
                          {score.roi.toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Score: {score.componentScores.roiScore.toFixed(0)}
                        </div>
                      </div>

                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">CPA</div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(score.cpa)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Score: {score.componentScores.cpaScore.toFixed(0)}
                        </div>
                      </div>

                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Conv. Rate</div>
                        <div className="text-lg font-bold text-gray-900">
                          {score.conversionRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Score: {score.componentScores.conversionScore.toFixed(0)}
                        </div>
                      </div>

                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Revenue</div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(score.revenue)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Spend: {formatCurrency(score.spend)}
                        </div>
                      </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-semibold text-gray-700">
                            Strengths
                          </span>
                        </div>
                        {score.strengths.length > 0 ? (
                          <ul className="space-y-1">
                            {score.strengths.map((strength, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No notable strengths</p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-semibold text-gray-700">
                            Weaknesses
                          </span>
                        </div>
                        {score.weaknesses.length > 0 ? (
                          <ul className="space-y-1">
                            {score.weaknesses.map((weakness, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No critical weaknesses</p>
                        )}
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {getRecommendationIcon(score.recommendation)}
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">
                            Recommendation
                          </div>
                          <div className="text-sm text-gray-700">{score.recommendation}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
