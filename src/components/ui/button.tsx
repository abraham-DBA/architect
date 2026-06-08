import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Spinner } from "@/components/ui/spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-md",
  secondary:
    "bg-stone-200 text-stone-900 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-100 dark:hover:bg-stone-600",
  ghost:
    "bg-transparent text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800",
  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-sm dark:bg-red-700 dark:hover:bg-red-600",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 text-sm gap-1.5",
  md: "min-h-11 px-4 text-sm gap-2",
  lg: "min-h-12 px-6 text-base gap-2",
  icon: "min-h-11 min-w-11 p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[var(--ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Spinner size={size === "sm" ? "sm" : "md"} />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
