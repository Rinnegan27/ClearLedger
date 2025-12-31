import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-lg border font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-burgundy-600 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-burgundy-50 text-burgundy-700",
        secondary:
          "border-transparent bg-terracotta-50 text-terracotta-700",
        success:
          "border-transparent bg-success-50 text-success-700",
        warning:
          "border-transparent bg-warning-50 text-warning-700",
        danger:
          "border-transparent bg-danger-50 text-danger-700",
        outline: "border-gray-300 text-gray-700",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-1.5 text-xs",
        lg: "px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
