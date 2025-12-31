import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, AlertTriangle, Shield } from "lucide-react";

type BadgeStatus = "scale" | "maintain" | "optimize" | "cut";

interface StatusBadgeProps {
  status: BadgeStatus;
  showIcon?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const statusConfig: Record<BadgeStatus, {
  label: string;
  className: string;
  icon: typeof ArrowUpRight;
}> = {
  scale: {
    label: "SCALE",
    className: "bg-success-50 text-success-700 border-success-200",
    icon: ArrowUpRight,
  },
  maintain: {
    label: "MAINTAIN",
    className: "bg-burgundy-50 text-burgundy-700 border-burgundy-200",
    icon: Shield,
  },
  optimize: {
    label: "OPTIMIZE",
    className: "bg-warning-50 text-warning-700 border-warning-200",
    icon: AlertTriangle,
  },
  cut: {
    label: "CUT",
    className: "bg-danger-50 text-danger-700 border-danger-200",
    icon: ArrowDownRight,
  },
};

export const StatusBadge = ({ status, showIcon = true, size = "sm", className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider border",
        size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />}
      {config.label}
    </span>
  );
};
