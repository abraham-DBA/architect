import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "w-full min-h-11 rounded-lg border bg-card px-3 py-2 text-base text-foreground outline-none transition-[border-color,box-shadow] duration-200 md:text-sm",
        "focus:ring-2 focus:ring-[var(--ring-color)] focus:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background",
        error
          ? "border-danger ring-1 ring-danger/30"
          : "border-border",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
