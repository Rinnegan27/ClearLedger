import { Phone, PhoneMissed, Clock, DollarSign } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

async function getCallInsights() {
  // TODO: Replace with actual database query
  return {
    totalCalls: 48,
    answeredCalls: 36,
    missedCalls: 12,
    averageDuration: 320, // seconds
    estimatedLostRevenue: 6000,
  };
}

export async function CallInsightsCard() {
  const insights = await getCallInsights();
  const missedCallRate = insights.totalCalls > 0 ? (insights.missedCalls / insights.totalCalls) * 100 : 0;
  const avgDurationMin = Math.floor(insights.averageDuration / 60);
  const avgDurationSec = insights.averageDuration % 60;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Call Analytics</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">How much revenue are you losing from missed calls?</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <Phone className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatNumber(insights.answeredCalls)}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Answered</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <PhoneMissed className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatNumber(insights.missedCalls)}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Missed ({missedCallRate.toFixed(0)}%)</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {avgDurationMin}:{avgDurationSec.toString().padStart(2, "0")}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Avg. Duration</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <DollarSign className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(insights.estimatedLostRevenue)}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Est. Lost Revenue</p>
          </div>
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <PhoneMissed className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">Action Required</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              You&apos;re missing {missedCallRate.toFixed(0)}% of calls. Consider adding staff during peak hours or implementing an
              automated callback system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
