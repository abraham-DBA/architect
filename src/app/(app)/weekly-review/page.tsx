"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonPage } from "@/components/ui/skeleton";
import { GOAL_STATUSES, GOAL_STATUS_LABELS, WEEKLY_REVIEW_QUESTIONS } from "@/lib/constants";
import { format } from "date-fns";

type Goal = {
  id: string;
  statement: string;
  rank: number;
  status: string;
};

type Review = {
  id: string;
  progressAnswer: string;
  adjustAnswer: string;
  becomeAnswer: string;
  completedAt: string;
};

export default function WeeklyReviewPage() {
  const [streak, setStreak] = useState(0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [goalStatuses, setGoalStatuses] = useState<Record<string, string>>({});
  const [ranks, setRanks] = useState<Record<string, number>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const [reviewRes, goalsRes] = await Promise.all([
      fetch("/api/weekly-review"),
      fetch("/api/priority-goals"),
    ]);
    const reviewData = await reviewRes.json();
    const goalsData = await goalsRes.json();
    const loadedGoals = goalsData.goals ?? [];
    setStreak(reviewData.streak ?? 0);
    setReviews(reviewData.reviews ?? []);
    setGoals(loadedGoals);
    setGoalStatuses(Object.fromEntries(loadedGoals.map((g: Goal) => [g.id, g.status])));
    setRanks(Object.fromEntries(loadedGoals.map((g: Goal) => [g.id, g.rank])));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch("/api/weekly-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        progressAnswer: answers[0],
        adjustAnswer: answers[1],
        becomeAnswer: answers[2],
        goalStatuses: goals.map((g) => ({ goalId: g.id, status: goalStatuses[g.id] })),
        ranks: goals.map((g) => ({ goalId: g.id, rank: ranks[g.id] })),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to submit review");
      setSubmitting(false);
      return;
    }
    toast.success("Weekly review submitted");
    setAnswers(["", "", ""]);
    setSubmitting(false);
    await load();
  }

  if (loading) {
    return <SkeletonPage />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Weekly Review"
        description="Reflect, adjust, and recommit to who you are becoming."
        actions={
          <div className="rounded-xl bg-accent-surface px-5 py-3 text-center shadow-sm">
            <div className="text-3xl font-bold text-accent-foreground">{streak}</div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted">Week streak</div>
          </div>
        }
      />

      <form onSubmit={onSubmit} className="space-y-6">
        {WEEKLY_REVIEW_QUESTIONS.map((question, index) => (
          <Card key={question} className="animate-fade-in-up" style={{ animationDelay: `${index * 75}ms` }}>
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-surface text-xs font-bold text-accent-foreground">
                {index + 1}
              </span>
              <label className="block text-sm font-medium leading-relaxed flex-1">{question}</label>
            </div>
            <Textarea
              className="mt-3"
              rows={4}
              placeholder="Take a moment to reflect…"
              value={answers[index]}
              onChange={(e) =>
                setAnswers((prev) => prev.map((a, i) => (i === index ? e.target.value : a)))
              }
              required
            />
          </Card>
        ))}

        <Card>
          <h2 className="text-lg font-semibold">Priority goal check-in</h2>
          <div className="mt-4 space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-3">
                <div className="md:col-span-1">
                  <p className="font-medium">{goal.statement}</p>
                </div>
                <Select
                  value={goalStatuses[goal.id]}
                  onChange={(e) =>
                    setGoalStatuses((prev) => ({ ...prev, [goal.id]: e.target.value }))
                  }
                >
                  {GOAL_STATUSES.map((s) => (
                    <option key={s} value={s}>{GOAL_STATUS_LABELS[s]}</option>
                  ))}
                </Select>
                <Select
                  value={ranks[goal.id]}
                  onChange={(e) =>
                    setRanks((prev) => ({ ...prev, [goal.id]: Number(e.target.value) }))
                  }
                >
                  {[1, 2, 3, 4].map((r) => (
                    <option key={r} value={r}>Rank {r}</option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
        </Card>

        <Button type="submit" loading={submitting} className="w-full sm:w-auto">
          {submitting ? "Submitting…" : "Submit weekly review"}
        </Button>
      </form>

      <Card>
        <button
          type="button"
          aria-expanded={showHistory}
          className="flex min-h-11 w-full items-center justify-between text-left text-lg font-semibold transition-colors hover:text-primary"
          onClick={() => setShowHistory((v) => !v)}
        >
          Past reviews ({reviews.length})
          {showHistory ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        {showHistory && (
          <div className="mt-4 space-y-4 animate-fade-in">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted">No reviews yet.</p>
            ) : (
              [...reviews].reverse().map((review) => (
                <div key={review.id} className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium text-muted">
                    {format(new Date(review.completedAt), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                  <div className="mt-3 space-y-2 text-sm">
                    <p><strong className="text-foreground">Progress:</strong> <span className="text-foreground/80">{review.progressAnswer}</span></p>
                    <p><strong className="text-foreground">Adjust:</strong> <span className="text-foreground/80">{review.adjustAnswer}</span></p>
                    <p><strong className="text-foreground">Become:</strong> <span className="text-foreground/80">{review.becomeAnswer}</span></p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
