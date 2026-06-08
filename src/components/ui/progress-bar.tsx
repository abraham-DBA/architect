import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  label,
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const capped = Math.min(Math.max(value, 0), 100);
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className="flex justify-between text-xs text-muted">
          <span>{label}</span>
          <span>{Math.round(capped)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500 animate-progress-fill"
          style={{ width: `${capped}%` }}
        />
      </div>
    </div>
  );
}
