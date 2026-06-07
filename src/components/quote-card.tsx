"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    await fetch("/api/quotes/favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId, favorite: next }),
    });
    setFavorite(next);
    toast.success(next ? "Quote favorited" : "Quote removed from favorites");
  }

  function shareQuote() {
    const shareText = `${text} — Jim Rohn`;
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
    <Card className="border-amber-200 bg-amber-50">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
        Rohn Quote of the Day
      </p>
      <blockquote className="mt-3 text-lg font-medium text-stone-800">&ldquo;{text}&rdquo;</blockquote>
      <p className="mt-2 text-sm text-stone-500">— Jim Rohn</p>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={toggleFavorite}>
          {favorite ? "Unfavorite" : "Favorite"}
        </Button>
        <Button variant="ghost" onClick={shareQuote}>
          Share
        </Button>
      </div>
    </Card>
  );
}
