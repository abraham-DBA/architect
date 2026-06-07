import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Alert({
  variant = "info",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: "info" | "error" | "success" | "warning" }) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-900",
    error: "border-red-200 bg-red-50 text-red-900",
    success: "border-green-200 bg-green-50 text-green-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
  };
  return (
    <div
      className={cn("rounded-lg border px-4 py-3 text-sm", styles[variant], className)}
      {...props}
    />
  );
}
