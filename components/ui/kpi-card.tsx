import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  variant?: "default" | "hero" | "compact";
  sparklineData?: number[];
  className?: string;
}

// Mini sparkline component
const Sparkline = ({ data, positive }: { data: number[]; positive: boolean }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <svg viewBox="0 0 100 40" className="w-full h-8 mt-3" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${positive ? 'pos' : 'neg'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? '#10B981' : '#EF4444'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={positive ? '#10B981' : '#EF4444'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        fill={`url(#gradient-${positive ? 'pos' : 'neg'})`}
        points={areaPoints}
      />
      <polyline
        fill="none"
        stroke={positive ? '#10B981' : '#EF4444'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export const KpiCard = ({
  label,
  value,
  change,
  changeLabel = "vs last 7 days",
  variant = "default",
  sparklineData,
  className,
}: KpiCardProps) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 p-5 group",
        variant === "hero" && "ring-2 ring-burgundy-600/20 bg-gradient-to-br from-burgundy-50 via-white to-white",
        variant === "compact" && "p-4",
        className
      )}
    >
      <div className="relative z-10">
        <p className="text-sm text-gray-600 mb-2">{label}</p>
        <p className={cn(
          "text-gray-900 font-bold transition-colors",
          variant === "hero" ? "text-3xl" : variant === "compact" ? "text-2xl" : "text-2xl"
        )}>
          {value}
        </p>

        {change !== undefined && (
          <div className="flex items-center gap-2 mt-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border",
                isPositive && "bg-success-50 text-success-700 border-success-200",
                isNegative && "bg-danger-50 text-danger-700 border-danger-200",
                !isPositive && !isNegative && "bg-gray-100 text-gray-600 border-transparent"
              )}
            >
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
              {isPositive && "+"}
              {change}%
            </span>
            <span className="text-xs text-gray-500">{changeLabel}</span>
          </div>
        )}

        {sparklineData && (
          <Sparkline data={sparklineData} positive={isPositive} />
        )}
      </div>
    </div>
  );
};
