import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-sm)] sm:p-5",
        "transition-[box-shadow,border-color] duration-200",
        interactive && "cursor-pointer hover:shadow-[var(--shadow-md)] hover:border-primary/20 active:scale-[0.99]",
        className
      )}
      {...props}
    />
  );
}
