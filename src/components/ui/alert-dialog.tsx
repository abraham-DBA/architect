"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AlertDialog({
  open,
  onClose,
  title,
  description,
  cancelText = "Cancel",
  actionText = "Continue",
  onAction,
  variant = "primary",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  cancelText?: string;
  actionText?: string;
  onAction: () => void;
  variant?: "primary" | "destructive";
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Focus trap
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    // Focus the first button (usually Cancel)
    requestAnimationFrame(() => {
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0]!.focus();
      } else {
        panelRef.current?.focus();
      }
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        aria-hidden="true"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        tabIndex={-1}
        className={cn(
          "relative z-10 max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-lg)]",
          "animate-scale-in"
        )}
      >
        <div>
          <h2 id="alert-dialog-title" className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-sm text-muted">
              {description}
            </p>
          )}
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "danger" : "primary"}
            onClick={() => {
              onAction();
              onClose();
            }}
            className="w-full sm:w-auto"
          >
            {actionText}
          </Button>
        </div>
      </div>
    </div>
  );
}
