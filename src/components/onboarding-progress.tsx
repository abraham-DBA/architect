import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type Step = {
  id: string;
  label: string;
  complete: boolean;
  optional?: boolean;
};

export function OnboardingProgress({ steps }: { steps: Step[] }) {
  const completedCount = steps.filter((s) => s.complete).length;
  const currentIndex = steps.findIndex((s) => !s.complete);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">Your progress</span>
        <span className="text-muted">
          {completedCount}/{steps.length} complete
        </span>
      </div>

      {/* Mobile: compact stepper */}
      <div className="flex items-center gap-2 md:hidden">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                step.complete
                  ? "bg-green-100 text-green-800"
                  : index === currentIndex
                    ? "bg-accent-surface text-accent-foreground ring-2 ring-primary/30"
                    : "bg-stone-100 text-muted"
              )}
            >
              {step.complete ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={cn("h-0.5 flex-1 rounded", step.complete ? "bg-green-300" : "bg-stone-200")} />
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted md:hidden">
        {currentIndex === -1
          ? "All steps complete!"
          : `Next: ${steps[currentIndex]?.label}${steps[currentIndex]?.optional ? " (optional)" : ""}`}
      </p>

      {/* Desktop: full cards */}
      <ol className="hidden gap-3 md:grid md:grid-cols-4">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              "rounded-lg border px-4 py-3 text-sm",
              step.complete
                ? "border-green-200 bg-green-50 text-green-900"
                : "border-border bg-card text-foreground"
            )}
          >
            <div className="font-medium">
              {index + 1}. {step.label}
              {step.optional ? " (optional)" : ""}
            </div>
            <div className="mt-1 text-xs opacity-80">
              {step.complete ? "Complete" : "In progress"}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
