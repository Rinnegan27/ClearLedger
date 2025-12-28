import { AlertCircle, TrendingUp, Target, AlertTriangle } from "lucide-react";

async function getWeeklyInsights() {
  // TODO: Replace with actual AI-generated insights from data
  return [
    {
      id: "1",
      type: "success" as const,
      title: "Meta Ads Performing Above Target",
      description: "Your Meta Ads campaigns have a 314% ROI, significantly higher than your target of 200%. Consider increasing budget allocation.",
      icon: TrendingUp,
    },
    {
      id: "2",
      type: "warning" as const,
      title: "High Missed Call Rate During Lunch Hours",
      description: "You're missing 40% of calls between 12-2 PM. Adding lunch coverage could capture an estimated $2,400/month in revenue.",
      icon: AlertTriangle,
    },
    {
      id: "3",
      type: "info" as const,
      title: "Referral Channel Opportunity",
      description: "Referral bookings have the highest profit margin ($1,766 avg) but only account for 8% of total bookings. Consider incentivizing referrals.",
      icon: Target,
    },
    {
      id: "4",
      type: "danger" as const,
      title: "Google Ads Cost Per Booking Increasing",
      description: "Your Google Ads cost per booking rose 18% this week to $333. Review keyword bids and ad quality scores.",
      icon: AlertCircle,
    },
  ];
}

const typeStyles = {
  success: {
    bg: "bg-green-50 dark:bg-green-900/10",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-900 dark:text-green-100",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600",
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-900/10",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-900 dark:text-yellow-100",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/10",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-900 dark:text-blue-100",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600",
  },
  danger: {
    bg: "bg-red-50 dark:bg-red-900/10",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-900 dark:text-red-100",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600",
  },
};

export async function WeeklyInsights() {
  const insights = await getWeeklyInsights();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">This Week's Insights</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Plain-English insights you can act on immediately</p>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => {
          const styles = typeStyles[insight.type];
          const Icon = insight.icon;

          return (
            <div key={insight.id} className={`border rounded-lg p-4 ${styles.bg} ${styles.border}`}>
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${styles.iconBg}`}>
                  <Icon className={`h-5 w-5 ${styles.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm font-semibold ${styles.text}`}>{insight.title}</h3>
                  <p className={`text-sm mt-1 ${styles.text} opacity-90`}>{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          New insights generated every Monday at 9 AM
        </p>
      </div>
    </div>
  );
}
