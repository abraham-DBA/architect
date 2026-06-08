import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300",
  success: "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-300",
  warning: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300",
  danger: "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-300",
  info: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300",
  neutral: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
