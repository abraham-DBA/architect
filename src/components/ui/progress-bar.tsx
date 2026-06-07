import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const capped = Math.min(Math.max(value, 0), 100);
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-stone-200", className)}>
      <div
        className="h-full rounded-full bg-amber-600 transition-all"
        style={{ width: `${capped}%` }}
      />
    </div>
  );
}
