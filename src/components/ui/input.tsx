import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full min-h-11 rounded-lg border bg-card px-3 py-2 text-base text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted/60 md:text-sm",
        "focus:ring-2 focus:ring-[var(--ring-color)] focus:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background",
        error
          ? "border-danger ring-1 ring-danger/30"
          : "border-border",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
