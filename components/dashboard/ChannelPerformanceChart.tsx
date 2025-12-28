import { formatCurrency, formatNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

async function getChannelPerformance() {
  // TODO: Replace with actual database query
  return [
    { name: "Google Ads", spend: 5000, bookings: 15, revenue: 18000, roi: 260 },
    { name: "Meta Ads", spend: 3500, bookings: 12, revenue: 14500, roi: 314 },
    { name: "Organic Search", spend: 0, bookings: 6, revenue: 7200, roi: 0 },
    { name: "Referral", spend: 1000, bookings: 3, revenue: 5300, roi: 430 },
  ];
}

export async function ChannelPerformanceChart() {
  const channels = await getChannelPerformance();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Channel Performance</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Which channels are driving results?</p>
      </div>

      <div className="space-y-4">
        {channels.map((channel) => {
          const costPerBooking = channel.bookings > 0 ? channel.spend / channel.bookings : 0;
          const isPositive = channel.roi > 200;

          return (
            <div key={channel.name} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{channel.name}</h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600 dark:text-slate-400">
                    <span>{formatNumber(channel.bookings)} bookings</span>
                    <span>{formatCurrency(channel.spend)} spend</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                      {channel.roi > 0 ? `${channel.roi}%` : "N/A"} ROI
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {formatCurrency(costPerBooking)}/booking
                  </p>
                </div>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${isPositive ? "bg-green-600" : "bg-blue-600"}`}
                  style={{ width: `${Math.min((channel.revenue / 20000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600 dark:text-slate-400">Recommendation:</span>
          <span className="font-medium text-blue-600">Scale Meta Ads, Cut Organic Spend</span>
        </div>
      </div>
    </div>
  );
}
