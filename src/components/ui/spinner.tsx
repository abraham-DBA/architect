import { cn } from "@/lib/utils";

export function Spinner({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-4 w-4 border-[2px]",
    md: "h-5 w-5 border-2",
    lg: "h-6 w-6 border-2",
  };

  return (
    <div
      className={cn(
        "animate-spin-slow rounded-full border-current border-t-transparent opacity-70",
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
