"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-in-up">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-surface text-danger">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-2xl font-bold">Something went wrong</h2>
      <p className="mt-2 max-w-md text-sm text-muted">
        An unexpected error occurred. You can try again, or navigate to a different page.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="secondary" onClick={() => (window.location.href = "/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
