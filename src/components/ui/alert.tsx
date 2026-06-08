import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Alert({
  variant = "info",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: "info" | "error" | "success" | "warning" }) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200",
    error: "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200",
    success: "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/50 dark:text-green-200",
    warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
  };
  return (
    <div
      role="alert"
      className={cn("rounded-lg border px-4 py-3 text-sm animate-fade-in-up", styles[variant], className)}
      {...props}
    />
  );
}
