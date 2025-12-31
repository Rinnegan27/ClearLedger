import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { Button } from "./button";
import { Check, Clock, ArrowRight, Target, Sparkles, TrendingUp } from "lucide-react";

interface NbaCardProps {
  title: string;
  status: "scale" | "maintain" | "optimize" | "cut";
  priority: number;
  impact: string;
  confidence: "High" | "Medium" | "Low";
  explanation: string;
  evidence: string;
  className?: string;
}

export const NbaCard = ({
  title,
  status,
  priority,
  impact,
  confidence,
  explanation,
  evidence,
  className,
}: NbaCardProps) => {
  const confidenceColors = {
    High: "text-success-700 bg-success-50",
    Medium: "text-warning-700 bg-warning-50",
    Low: "text-gray-600 bg-gray-100",
  };

  return (
    <div className={cn(
      "rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 p-6 group relative flex flex-col",
      status === "scale" && "ring-1 ring-success-500/20",
      status === "cut" && "ring-1 ring-danger-500/20",
      className
    )}>
      {/* Priority indicator bar */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 rounded-t-xl",
          status === "scale" && "bg-gradient-to-r from-success-600 to-success-400",
          status === "cut" && "bg-gradient-to-r from-danger-600 to-danger-400",
          status === "optimize" && "bg-gradient-to-r from-warning-600 to-warning-400",
          status === "maintain" && "bg-gradient-to-r from-burgundy-600 to-burgundy-400"
        )}
      />

      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <StatusBadge status={status} size="md" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 h-9">
            <Target className="w-4 h-4 text-burgundy-600" />
            <span className="font-bold text-gray-900">{priority}</span>
            <span className="text-xs text-gray-500">/100</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-4 leading-snug h-14 flex items-center">{title}</h3>

        {/* Metrics */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success-50 border border-success-200 h-9">
            <TrendingUp className="w-4 h-4 text-success-600" />
            <span className="text-sm font-semibold text-success-700 whitespace-nowrap">{impact}</span>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border h-9",
            confidenceColors[confidence]
          )}>
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">{confidence}</span>
          </div>
        </div>

        {/* Explanation */}
        <div className="border-t border-gray-200 pt-4 mb-4 flex-1 flex flex-col">
          <p className="text-sm text-gray-600 mb-3 leading-relaxed h-16">{explanation}</p>
          <div className="px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 h-12 flex items-center">
            <code className="text-xs font-mono text-gray-900 leading-relaxed">{evidence}</code>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center flex-wrap gap-2 mt-auto">
          <Button size="sm" className="gap-1.5 px-4 h-9">
            <Check className="w-3.5 h-3.5" />
            Mark Done
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 px-4 h-9">
            <Clock className="w-3.5 h-3.5" />
            Snooze
          </Button>
          <Button size="sm" variant="ghost" className="gap-1.5 ml-auto text-burgundy-600 hover:text-burgundy-700 hover:bg-burgundy-50 h-9">
            View Evidence
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
