import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border bg-card px-3 py-2.5 text-base text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted/60 md:text-sm",
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
Textarea.displayName = "Textarea";
