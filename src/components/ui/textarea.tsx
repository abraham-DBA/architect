import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-base text-foreground outline-none ring-primary focus:ring-2 md:text-sm",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
