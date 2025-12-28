import { DollarSign, TrendingUp, Calendar, Phone, ArrowUp, ArrowDown, TrendingDown } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

async function getMetrics() {
  // TODO: Replace with actual database query
  return {
    totalSpend: 12500,
    totalRevenue: 45000,
    totalBookings: 36,
    missedCalls: 12,
  };
}

export async function MetricsOverview() {
  const metrics = await getMetrics();
  const costPerBooking = metrics.totalBookings > 0 ? metrics.totalSpend / metrics.totalBookings : 0;

  const cards = [
    {
      title: "Cost Per Booking",
      value: formatCurrency(costPerBooking),
      icon: DollarSign,
      trend: "8%",
      trendValue: -8,
      description: "vs. last month",
      gradient: "gradient-teal",
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
      trendIcon: ArrowDown,
      borderColor: "hover:border-teal-500",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(metrics.totalRevenue),
      icon: TrendingUp,
      trend: "12%",
      trendValue: 12,
      description: "vs. last month",
      gradient: "gradient-primary",
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      trendIcon: ArrowUp,
      borderColor: "hover:border-indigo-500",
    },
    {
      title: "Booked Jobs",
      value: formatNumber(metrics.totalBookings),
      icon: Calendar,
      trend: "5",
      trendValue: 5,
      description: "this month",
      gradient: "gradient-success",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      trendIcon: ArrowUp,
      borderColor: "hover:border-emerald-500",
    },
    {
      title: "Missed Calls",
      value: formatNumber(metrics.missedCalls),
      icon: Phone,
      trend: formatCurrency(metrics.missedCalls * 500),
      trendValue: -metrics.missedCalls,
      description: "est. lost revenue",
      gradient: "gradient-danger",
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
      trendIcon: TrendingDown,
      borderColor: "hover:border-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className={`metric-card group cursor-pointer relative ${card.borderColor} fade-in fade-in-${index + 1}`}
        >
          {/* Top indicator line - shows on hover */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-t-[20px]`}></div>

          <div className="flex items-start justify-between mb-5">
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 letter-spacing-tight">
                {card.title}
              </p>
              <p className="text-4xl font-bold text-gray-900 tracking-tight">
                {card.value}
              </p>
            </div>
            <div className={`${card.iconBg} ${card.iconColor} p-3.5 rounded-2xl group-hover:scale-110 transition-all shadow-soft`}>
              <card.icon className="w-6 h-6" strokeWidth={2.5} />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100">
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl ${
                card.trendValue > 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              <card.trendIcon className="w-4 h-4" strokeWidth={2.5} />
              {card.trend}
            </span>
            <span className="text-sm text-gray-600 font-medium">
              {card.description}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
