import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full min-h-11 rounded-lg border border-border bg-card px-3 py-2 text-base text-foreground outline-none ring-primary focus:ring-2 md:text-sm",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
