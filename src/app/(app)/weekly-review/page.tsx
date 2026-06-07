"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
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
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

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
      return;
    }
    toast.success("Weekly review submitted");
    setAnswers(["", "", ""]);
    await load();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Weekly Review"
        description="Reflect, adjust, and recommit to who you are becoming."
        actions={
          <div className="rounded-xl bg-accent-surface px-5 py-3 text-center">
            <div className="text-3xl font-bold text-accent-foreground">{streak}</div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted">Week streak</div>
          </div>
        }
      />

      <form onSubmit={onSubmit} className="space-y-6">
        {WEEKLY_REVIEW_QUESTIONS.map((question, index) => (
          <Card key={question}>
            <label className="block text-sm font-medium">{question}</label>
            <Textarea
              className="mt-3"
              rows={4}
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
              <div key={goal.id} className="grid gap-3 rounded-lg border border-stone-200 p-4 md:grid-cols-3">
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

        <Button type="submit">Submit weekly review</Button>
      </form>

      <Card>
        <button
          type="button"
          aria-expanded={showHistory}
          className="flex min-h-11 w-full items-center justify-between text-left text-lg font-semibold"
          onClick={() => setShowHistory((v) => !v)}
        >
          Past reviews
          <span>{showHistory ? "−" : "+"}</span>
        </button>
        {showHistory && (
          <div className="mt-4 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-stone-500">No reviews yet.</p>
            ) : (
              [...reviews].reverse().map((review) => (
                <div key={review.id} className="rounded-lg border border-stone-200 p-4">
                  <p className="text-sm font-medium text-stone-500">
                    {format(new Date(review.completedAt), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                  <div className="mt-3 space-y-2 text-sm">
                    <p><strong>Progress:</strong> {review.progressAnswer}</p>
                    <p><strong>Adjust:</strong> {review.adjustAnswer}</p>
                    <p><strong>Become:</strong> {review.becomeAnswer}</p>
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
