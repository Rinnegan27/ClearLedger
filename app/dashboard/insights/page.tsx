"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TrendingUp, AlertCircle, CheckCircle, ArrowRight, Phone, DollarSign, Target } from "lucide-react";

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
    bgColor: "#F0FDF4"
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
    color: "#EF4444",
    bgColor: "#FEF2F2"
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
    bgColor: "#FFFBEB"
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
    color: "#401D19",
    bgColor: "#F5F3F1"
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
    color: "#800020",
    bgColor: "#FFF9F6"
  }
];

export default function InsightsPage() {
  return (
    <div className="min-h-screen" style={{background: '#F5F3F1'}}>
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{color: '#401D19'}}>Insights & Next Actions</h1>
          <p className="text-base" style={{color: '#6B5B52'}}>AI-powered recommendations to grow your business</p>
        </div>

        {/* Priority Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg" style={{border: '1px solid #E5E5E5'}}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: '#FEF2F2'}}>
                <AlertCircle className="w-5 h-5" style={{color: '#EF4444'}} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{color: '#401D19'}}>1</div>
                <div className="text-sm" style={{color: '#6B5B52'}}>Critical</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg" style={{border: '1px solid #E5E5E5'}}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: '#FFF7ED'}}>
                <TrendingUp className="w-5 h-5" style={{color: '#F59E0B'}} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{color: '#401D19'}}>2</div>
                <div className="text-sm" style={{color: '#6B5B52'}}>High Priority</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg" style={{border: '1px solid #E5E5E5'}}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: '#F0FDF4'}}>
                <CheckCircle className="w-5 h-5" style={{color: '#10B981'}} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{color: '#401D19'}}>2</div>
                <div className="text-sm" style={{color: '#6B5B52'}}>Medium Priority</div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights List */}
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            const priorityConfig = {
              critical: { label: 'Critical', color: '#EF4444', bg: '#FEF2F2' },
              high: { label: 'High', color: '#F59E0B', bg: '#FFF7ED' },
              medium: { label: 'Medium', color: '#10B981', bg: '#F0FDF4' },
              low: { label: 'Low', color: '#800020', bg: '#FFF9F6' }
            }[insight.priority];

            return (
              <div
                key={insight.id}
                className="bg-white rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                style={{border: '1px solid #E5E5E5'}}
              >
                {/* Top accent bar */}
                <div className="h-1" style={{background: insight.color}}></div>

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: insight.bgColor}}>
                        <Icon className="w-6 h-6" style={{color: insight.color}} />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold" style={{color: '#401D19'}}>{insight.title}</h3>
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded-full"
                            style={{background: priorityConfig.bg, color: priorityConfig.color}}
                          >
                            {priorityConfig.label}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{color: '#6B5B52'}}>
                          {insight.description}
                        </p>
                      </div>
                    </div>

                    {/* Impact */}
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold mb-1" style={{color: insight.color}}>
                        {insight.impact}
                      </div>
                      <div className="text-xs font-semibold" style={{color: '#8C7B72'}}>
                        {insight.impactLabel}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between pt-4" style={{borderTop: '1px solid #F0F0F0'}}>
                    <div className="text-sm font-semibold" style={{color: '#8C7B72'}}>
                      Recommended action
                    </div>
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{background: insight.color}}
                    >
                      {insight.action}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 bg-white rounded-lg p-8 text-center" style={{border: '1px solid #E5E5E5'}}>
          <h3 className="text-xl font-bold mb-2" style={{color: '#401D19'}}>Want personalized recommendations?</h3>
          <p className="text-sm mb-6" style={{color: '#6B5B52', maxWidth: '600px', margin: '0 auto 24px'}}>
            Our AI analyzes your data daily to find new opportunities. Enable smart alerts to get notified when we spot something important.
          </p>
          <button
            className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{background: '#FF682C'}}
          >
            Enable Smart Alerts
          </button>
        </div>
      </main>
    </div>
  );
}
