"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuoteCard({
  quoteId,
  text,
  initialFavorite,
}: {
  quoteId: string;
  text: string;
  initialFavorite: boolean;
}) {
  const [favorite, setFavorite] = useState(initialFavorite);

  async function toggleFavorite() {
    const next = !favorite;
    setFavorite(next);
    await fetch("/api/quotes/favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId, favorite: next }),
    });
    toast.success(next ? "Quote favorited" : "Quote removed from favorites");
  }

  function shareQuote() {
    const shareText = `"${text}" — Jim Rohn`;
    if (navigator.share) {
      navigator.share({ text: shareText, title: "Jim Rohn Quote" });
      return;
    }
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  }

  return (
    <Card className="relative overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50 via-amber-50/80 to-orange-50 dark:border-amber-800/50 dark:from-amber-950/40 dark:via-amber-950/20 dark:to-orange-950/20">
      {/* Decorative quote mark */}
      <div className="absolute -right-4 -top-4 text-8xl font-serif leading-none text-amber-200/50 dark:text-amber-800/30 select-none" aria-hidden="true">
        &ldquo;
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
        Rohn Quote of the Day
      </p>
      <blockquote className="relative mt-3 text-lg font-medium text-foreground leading-relaxed">
        &ldquo;{text}&rdquo;
      </blockquote>
      <p className="mt-2 text-sm text-muted">— Jim Rohn</p>
      <div className="mt-4 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleFavorite}
          className="gap-1.5"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-all",
              favorite && "fill-red-500 text-red-500 scale-110"
            )}
          />
          {favorite ? "Favorited" : "Favorite"}
        </Button>
        <Button variant="ghost" size="sm" onClick={shareQuote} className="gap-1.5">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>
    </Card>
  );
}
