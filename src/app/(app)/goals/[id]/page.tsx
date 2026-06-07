"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  CATEGORY_LABELS,
  HORIZON_LABELS,
  LIFE_CATEGORIES,
  TIME_HORIZONS,
} from "@/lib/constants";
import {
  calculateProjectedCompletionDate,
  calculateSavingsProgress,
  formatCurrency,
  isOverdue,
  toDateInputValue,
} from "@/lib/utils";
import { format } from "date-fns";

type ActionStep = {
  id: string;
  description: string;
  deadline: string | null;
  done: boolean;
  sortOrder: number;
  completedAt: string | null;
};

type Goal = {
  id: string;
  statement: string;
  rank: number;
  category: string;
  timeHorizon: string;
  whyStatement: string;
  identityBecoming: string;
  financialTarget: number | null;
  actionSteps: ActionStep[];
  savingsContributions: { id: string; amount: number; date: string }[];
  createdAt: string;
};

export default function GoalDetailPage() {
  const params = useParams<{ id: string }>();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Goal | null>(null);
  const [contribution, setContribution] = useState({ amount: "", date: "" });

  async function load() {
    const res = await fetch(`/api/priority-goals/${params.id}`);
    const data = await res.json();
    setGoal(data);
    setDraft(data);
  }

  useEffect(() => {
    load();
  }, [params.id]);

  if (!goal || !draft) {
    return <Card>Loading goal...</Card>;
  }

  const doneSteps = goal.actionSteps.filter((s) => s.done).length;
  const totalSteps = goal.actionSteps.length;
  const completion =
    totalSteps === 0 ? 0 : doneSteps === totalSteps ? 100 : Math.round((doneSteps / totalSteps) * 100);

  const target = Number(goal.financialTarget ?? 0);
  const saved = goal.savingsContributions.reduce((sum, c) => sum + Number(c.amount), 0);
  const savings = calculateSavingsProgress(saved, target);
  const projected =
    target > 0
      ? calculateProjectedCompletionDate(
          goal.savingsContributions.map((c) => ({ date: c.date, amount: Number(c.amount) })),
          target,
          saved
        )
      : null;

  const timeline = [
    ...goal.savingsContributions.map((c) => ({
      type: "savings" as const,
      date: c.date,
      label: `Saved ${formatCurrency(Number(c.amount))}`,
    })),
    ...goal.actionSteps
      .filter((s) => s.done && s.completedAt)
      .map((s) => ({
        type: "action" as const,
        date: s.completedAt!,
        label: `Completed: ${s.description}`,
      })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  async function saveEdits() {
    if (!goal || !draft) return;
    const res = await fetch(`/api/priority-goals/${goal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        statement: draft.statement,
        category: draft.category,
        timeHorizon: draft.timeHorizon,
        whyStatement: draft.whyStatement,
        identityBecoming: draft.identityBecoming,
        financialTarget: draft.financialTarget,
        actionSteps: draft.actionSteps.map((s, index) => ({
          id: s.id,
          description: s.description,
          deadline: s.deadline,
          done: s.done,
          sortOrder: index,
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to save");
      return;
    }
    setGoal(data);
    setDraft(data);
    setEditing(false);
    toast.success("Goal updated");
  }

  async function toggleStep(stepId: string, done: boolean) {
    if (!goal) return;
    const res = await fetch(`/api/priority-goals/${goal.id}/action-steps/${stepId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    if (!res.ok) {
      toast.error("Failed to update step");
      return;
    }
    toast.success(done ? "Step completed" : "Step marked incomplete");
    await load();
  }

  async function logContribution() {
    if (!goal || !contribution.amount || !contribution.date) return;
    const res = await fetch(`/api/priority-goals/${goal.id}/savings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(contribution.amount),
        date: contribution.date,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Failed to log contribution");
      return;
    }
    setContribution({ amount: "", date: "" });
    toast.success("Contribution logged");
    await load();
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: `Goal #${goal.rank}` },
        ]}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl lg:text-4xl">
            {goal.statement}
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            {CATEGORY_LABELS[goal.category]} · {HORIZON_LABELS[goal.timeHorizon]}
          </p>
        </div>
        <Button variant="secondary" className="w-full shrink-0 sm:w-auto" onClick={() => setEditing((v) => !v)}>
          {editing ? "Cancel edit" : "Edit goal"}
        </Button>
      </div>

      {editing ? (
        <Card className="space-y-4">
          <Textarea
            value={draft.statement}
            onChange={(e) => setDraft({ ...draft, statement: e.target.value })}
            rows={2}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            >
              {LIFE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </Select>
            <Select
              value={draft.timeHorizon}
              onChange={(e) => setDraft({ ...draft, timeHorizon: e.target.value })}
            >
              {TIME_HORIZONS.map((h) => (
                <option key={h} value={h}>{HORIZON_LABELS[h]}</option>
              ))}
            </Select>
          </div>
          <Textarea
            value={draft.whyStatement}
            onChange={(e) => setDraft({ ...draft, whyStatement: e.target.value })}
            rows={3}
          />
          <Textarea
            value={draft.identityBecoming}
            onChange={(e) => setDraft({ ...draft, identityBecoming: e.target.value })}
            rows={3}
          />
          {draft.actionSteps.map((step, index) => (
            <div key={step.id ?? index} className="grid gap-2 md:grid-cols-2">
              <Input
                value={step.description}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    actionSteps: draft.actionSteps.map((s, i) =>
                      i === index ? { ...s, description: e.target.value } : s
                    ),
                  })
                }
              />
              <Input
                type="date"
                value={toDateInputValue(step.deadline)}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    actionSteps: draft.actionSteps.map((s, i) =>
                      i === index ? { ...s, deadline: e.target.value } : s
                    ),
                  })
                }
              />
            </div>
          ))}
          <Button onClick={saveEdits}>Save changes</Button>
        </Card>
      ) : (
        <>
          <Card className="border-amber-300 bg-amber-50">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-900">Reason Fuel</h2>
            <p className="mt-2 text-lg text-stone-800">{goal.whyStatement}</p>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Who Must I Become</h2>
            <p className="mt-2 text-stone-800">{goal.identityBecoming}</p>
          </Card>
        </>
      )}

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Action plan</h2>
          <span>{totalSteps === 0 ? "Add steps" : `${completion}%`}</span>
        </div>
        <ProgressBar value={completion} className="mt-3" />
        {totalSteps === 0 ? (
          <p className="mt-4 text-sm text-stone-500">Add action steps to bridge dreams and achievement.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {goal.actionSteps.map((step) => (
              <li
                key={step.id}
                className={`flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2 ${
                  isOverdue(step.deadline, step.done) ? "border-red-300 bg-red-50" : "border-border"
                }`}
              >
                <input
                  type="checkbox"
                  checked={step.done}
                  onChange={(e) => toggleStep(step.id, e.target.checked)}
                  className="h-5 w-5 shrink-0 accent-amber-700"
                />
                <div className="flex-1">
                  <p className={step.done ? "line-through text-stone-400" : ""}>{step.description}</p>
                  {step.deadline && (
                    <p className="text-xs text-stone-500">
                      Due {format(new Date(step.deadline), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Savings progress</h2>
        {target <= 0 ? (
          <p className="mt-3 text-sm text-stone-500">Set a financial target to track savings progress.</p>
        ) : (
          <>
            <div className="mt-3 flex justify-between text-sm">
              <span>{formatCurrency(saved)} saved</span>
              <span>{savings.cappedPercentage.toFixed(1)}% of {formatCurrency(target)}</span>
            </div>
            <ProgressBar value={savings.cappedPercentage} className="mt-2" />
            <p className="mt-2 text-sm text-stone-600">
              Remaining: {formatCurrency(savings.remaining)}
            </p>
            <p className="mt-1 text-sm text-stone-600">
              {goal.savingsContributions.length === 0
                ? "Start saving to see projection"
                : projected
                  ? `Projected completion: ${format(projected, "MMMM d, yyyy")}`
                  : "Start saving to see projection"}
            </p>
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Amount"
                value={contribution.amount}
                onChange={(e) => setContribution((c) => ({ ...c, amount: e.target.value }))}
              />
              <Input
                type="date"
                value={contribution.date}
                onChange={(e) => setContribution((c) => ({ ...c, date: e.target.value }))}
              />
              <Button onClick={logContribution}>Log contribution</Button>
            </div>
          </>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Progress timeline</h2>
        {timeline.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">No progress logged yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {timeline.map((item, index) => (
              <li key={`${item.type}-${index}`} className="border-l-2 border-amber-300 pl-4">
                <p className="text-sm text-stone-500">{format(new Date(item.date), "MMM d, yyyy")}</p>
                <p className="font-medium">{item.label}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
