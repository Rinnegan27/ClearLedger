import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "card" | "avatar" | "button" | "table" | "default";
}

function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  const variantClasses = {
    text: "h-4 w-full rounded",
    card: "h-32 w-full rounded-lg",
    avatar: "h-10 w-10 rounded-full",
    button: "h-9 w-24 rounded-lg",
    table: "h-12 w-full rounded",
    default: "rounded-lg",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton variants for common use cases
 */
const SkeletonText = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <Skeleton variant="text" className={className} {...props} />
);

const SkeletonCard = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <Skeleton variant="card" className={className} {...props} />
);

const SkeletonAvatar = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <Skeleton variant="avatar" className={className} {...props} />
);

const SkeletonButton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <Skeleton variant="button" className={className} {...props} />
);

const SkeletonTable = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <Skeleton variant="table" className={className} {...props} />
);

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonButton, SkeletonTable };
