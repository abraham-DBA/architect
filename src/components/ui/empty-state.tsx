import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-surface text-accent-foreground animate-float">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted leading-relaxed">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </Card>
  );
}
