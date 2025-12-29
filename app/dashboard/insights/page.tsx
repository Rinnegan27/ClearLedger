"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TrendingUp, AlertCircle, CheckCircle, ArrowRight, Phone, DollarSign, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const insights = [
  {
    id: 1,
    priority: "high",
    type: "opportunity",
    title: "Reduce cost per booking by 15%",
    description: "Meta Ads is outperforming Google Ads with 314% ROI vs 260%. Shift $1,500 from Google to Meta to lower your cost per booking from $347 to $295.",
    impact: "$1,872",
    impactLabel: "Monthly savings",
    action: "Reallocate budget",
    icon: DollarSign,
    color: "#10B981",
    bgColor: "bg-success-50",
    textColor: "text-success-600"
  },
  {
    id: 2,
    priority: "critical",
    type: "alert",
    title: "12 missed calls = $6,000 in lost revenue",
    description: "You're missing 25% of incoming calls during peak hours (2-4 PM). Add a second line or enable voicemail-to-text to capture these leads.",
    impact: "$6,000",
    impactLabel: "Revenue at risk",
    action: "Fix phone coverage",
    icon: Phone,
    color: "#DC2626",
    bgColor: "bg-danger-50",
    textColor: "text-danger-600"
  },
  {
    id: 3,
    priority: "medium",
    type: "opportunity",
    title: "Organic traffic is your best ROI",
    description: "Your organic channel has infinite ROI with 6 bookings and $0 spend. Invest $500/month in SEO to double organic bookings.",
    impact: "+6",
    impactLabel: "Potential bookings",
    action: "Invest in SEO",
    icon: TrendingUp,
    color: "#F59E0B",
    bgColor: "bg-warning-50",
    textColor: "text-warning-600"
  },
  {
    id: 4,
    priority: "medium",
    type: "opportunity",
    title: "Referrals are crushing it",
    description: "Referrals deliver 430% ROI—your highest performing channel. Create a $50 referral incentive program to generate 5+ new referrals monthly.",
    impact: "+5",
    impactLabel: "Monthly referrals",
    action: "Launch referral program",
    icon: Target,
    color: "#C67B5C",
    bgColor: "bg-terracotta-50",
    textColor: "text-terracotta-600"
  },
  {
    id: 5,
    priority: "low",
    type: "optimization",
    title: "Your peak booking day is Wednesday",
    description: "43% of bookings happen on Wednesday. Schedule your highest-value campaigns and promotions for Tuesday evening to capture this demand.",
    impact: "+12%",
    impactLabel: "Conversion boost",
    action: "Optimize scheduling",
    icon: CheckCircle,
    color: "#6B2737",
    bgColor: "bg-burgundy-50",
    textColor: "text-burgundy-600"
  }
];

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold mb-1.5 text-gray-900">Insights & Next Actions</h1>
          <p className="text-sm text-gray-600">AI-powered recommendations to grow your business</p>
        </div>

        {/* Priority Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <Card>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-danger-50">
                  <AlertCircle className="w-5 h-5 text-danger-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">1</div>
                  <div className="text-sm text-gray-600">Critical</div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-warning-50">
                  <TrendingUp className="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">1</div>
                  <div className="text-sm text-gray-600">High Priority</div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-success-50">
                  <CheckCircle className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">3</div>
                  <div className="text-sm text-gray-600">Medium Priority</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Insights List */}
        <div className="space-y-6">
          {insights.map((insight) => {
            const Icon = insight.icon;
            const priorityConfig = {
              critical: { variant: "danger" as const, label: "Critical" },
              high: { variant: "warning" as const, label: "High" },
              medium: { variant: "success" as const, label: "Medium" },
              low: { variant: "default" as const, label: "Low" }
            }[insight.priority] || { variant: "default" as const, label: "Low" };

            return (
              <Card
                key={insight.id}
                className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden"
                accent
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${insight.bgColor}`}>
                        <Icon className={`w-6 h-6 ${insight.textColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-heading text-lg font-bold text-gray-900">{insight.title}</h3>
                          <Badge variant={priorityConfig.variant} size="sm">
                            {priorityConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-600">
                          {insight.description}
                        </p>
                      </div>
                    </div>

                    {/* Impact */}
                    <div className="text-right ml-4">
                      <div className={`text-2xl font-bold mb-1 ${insight.textColor}`}>
                        {insight.impact}
                      </div>
                      <div className="text-xs font-semibold text-gray-500">
                        {insight.impactLabel}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm font-semibold text-gray-500">
                      Recommended action
                    </div>
                    <Button
                      style={{ backgroundColor: insight.color }}
                      className="gap-2 text-white hover:opacity-90"
                      size="sm"
                    >
                      {insight.action}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <Card className="mt-8">
          <div className="p-8 text-center">
            <h3 className="font-heading text-xl font-bold mb-2 text-gray-900">Want personalized recommendations?</h3>
            <p className="text-sm text-gray-600 max-w-[600px] mx-auto mb-6">
              Our AI analyzes your data daily to find new opportunities. Enable smart alerts to get notified when we spot something important.
            </p>
            <Button variant="secondary" size="lg">
              Enable Smart Alerts
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
