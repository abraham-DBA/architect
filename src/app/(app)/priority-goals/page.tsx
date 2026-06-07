"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lightbulb } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import {
  CATEGORY_LABELS,
  HORIZON_LABELS,
  LIFE_CATEGORIES,
  PRIORITY_GOALS_REQUIRED,
  TIME_HORIZONS,
} from "@/lib/constants";

type BrainDumpEntry = {
  id: string;
  content: string;
  category: string | null;
  timeHorizon: string | null;
};

type DraftGoal = {
  brainDumpEntryId?: string;
  statement: string;
  category: string;
  timeHorizon: string;
  rank: number;
  whyStatement: string;
  identityBecoming: string;
  financialTarget: string;
  actionSteps: { description: string; deadline: string }[];
};

const emptyGoal = (rank: number): DraftGoal => ({
  statement: "",
  category: "SKILLS",
  timeHorizon: "ONE_YEAR",
  rank,
  whyStatement: "",
  identityBecoming: "",
  financialTarget: "",
  actionSteps: [{ description: "", deadline: "" }],
});

export default function PriorityGoalsPage() {
  const router = useRouter();
  const [brainDump, setBrainDump] = useState<BrainDumpEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [goals, setGoals] = useState<DraftGoal[]>(
    Array.from({ length: PRIORITY_GOALS_REQUIRED }, (_, i) => emptyGoal(i + 1))
  );
  useEffect(() => {
    fetch("/api/brain-dump")
      .then((r) => r.json())
      .then((data) => setBrainDump(data.entries ?? []));
    fetch("/api/priority-goals")
      .then((r) => r.json())
      .then((data) => {
        if (data.goals?.length === PRIORITY_GOALS_REQUIRED) {
          setGoals(
            data.goals.map((g: DraftGoal & { financialTarget?: number | null; actionSteps: { description: string; deadline?: string | null }[] }) => ({
              brainDumpEntryId: (g as { brainDumpEntryId?: string }).brainDumpEntryId,
              statement: g.statement,
              category: g.category,
              timeHorizon: g.timeHorizon,
              rank: g.rank,
              whyStatement: g.whyStatement,
              identityBecoming: g.identityBecoming,
              financialTarget: g.financialTarget ? String(g.financialTarget) : "",
              actionSteps: g.actionSteps.map((s) => ({
                description: s.description,
                deadline: s.deadline ? s.deadline.slice(0, 10) : "",
              })),
            }))
          );
        }
      });
  }, []);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= PRIORITY_GOALS_REQUIRED) {
        toast.error(`You can only select exactly ${PRIORITY_GOALS_REQUIRED} priority goals.`);
        return prev;
      }
      const entry = brainDump.find((e) => e.id === id);
      if (entry && !entry.category) {
        toast.error("Entry is incomplete — assign a life category and time horizon in Brain Dump first.");
        return prev;
      }
      if (entry && !entry.timeHorizon) {
        toast.error("Entry is incomplete — assign a life category and time horizon in Brain Dump first.");
        return prev;
      }
      const next = [...prev, id];
      const index = next.length - 1;
      if (entry) {
        setGoals((gs) =>
          gs.map((g, i) =>
            i === index
              ? {
                  ...g,
                  brainDumpEntryId: entry.id,
                  statement: entry.content,
                  category: entry.category!,
                  timeHorizon: entry.timeHorizon!,
                }
              : g
          )
        );
      }
      return next;
    });
  }

  function updateGoal(index: number, patch: Partial<DraftGoal>) {
    setGoals((prev) => prev.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  }

  function updateStep(goalIndex: number, stepIndex: number, patch: Partial<{ description: string; deadline: string }>) {
    setGoals((prev) =>
      prev.map((g, i) =>
        i === goalIndex
          ? {
              ...g,
              actionSteps: g.actionSteps.map((s, si) => (si === stepIndex ? { ...s, ...patch } : s)),
            }
          : g
      )
    );
  }

  async function saveGoals() {
    if (selectedIds.length > 0 && selectedIds.length !== PRIORITY_GOALS_REQUIRED) {
      toast.error(`Select exactly ${PRIORITY_GOALS_REQUIRED} goals before proceeding.`);
      return;
    }

    const payload = {
      goals: goals.map((g) => ({
        brainDumpEntryId: g.brainDumpEntryId,
        statement: g.statement,
        category: g.category,
        timeHorizon: g.timeHorizon,
        rank: g.rank,
        whyStatement: g.whyStatement,
        identityBecoming: g.identityBecoming,
        financialTarget: g.financialTarget ? Number(g.financialTarget) : null,
        actionSteps: g.actionSteps.filter((s) => s.description.trim()),
      })),
    };

    const res = await fetch("/api/priority-goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to save priority goals");
      return;
    }
    toast.success("Priority goals saved");
    router.push("/dashboard");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Priority Goal Builder"
        description="Select exactly 4 goals, define your WHY, who you must become, and your action plan."
      />

      <Card>
        <h2 className="text-lg font-semibold">Select from brain dump ({selectedIds.length}/{PRIORITY_GOALS_REQUIRED})</h2>
        {brainDump.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Lightbulb}
              title="No brain dump entries"
              description="Capture aspirations first, then return to select your top 4."
              action={
                <Link href="/brain-dump">
                  <Button>Go to Brain Dump</Button>
                </Link>
              }
            />
          </div>
        ) : (
        <div className="mt-4 space-y-2">
          {brainDump.map((entry) => (
            <label key={entry.id} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border p-3 active:bg-stone-50">
              <input
                type="checkbox"
                checked={selectedIds.includes(entry.id)}
                onChange={() => toggleSelect(entry.id)}
                className="mt-1 h-5 w-5 shrink-0 accent-amber-700"
              />
              <div>
                <p>{entry.content}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {entry.category ? CATEGORY_LABELS[entry.category] : "No category"} ·{" "}
                  {entry.timeHorizon ? HORIZON_LABELS[entry.timeHorizon] : "No horizon"}
                </p>
              </div>
            </label>
          ))}
        </div>
        )}
      </Card>

      {goals.map((goal, index) => (
        <Card key={index}>
          <h2 className="text-lg font-semibold">Priority Goal #{index + 1}</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Goal statement</label>
              <Textarea
                value={goal.statement}
                onChange={(e) => updateGoal(index, { statement: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Select value={goal.category} onChange={(e) => updateGoal(index, { category: e.target.value })}>
                {LIFE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </Select>
              <Select value={goal.timeHorizon} onChange={(e) => updateGoal(index, { timeHorizon: e.target.value })}>
                {TIME_HORIZONS.map((h) => (
                  <option key={h} value={h}>{HORIZON_LABELS[h]}</option>
                ))}
              </Select>
              <Select value={goal.rank} onChange={(e) => updateGoal(index, { rank: Number(e.target.value) })}>
                {[1, 2, 3, 4].map((r) => (
                  <option key={r} value={r}>Rank {r}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">WHY (reason fuel)</label>
              <Textarea
                value={goal.whyStatement}
                onChange={(e) => updateGoal(index, { whyStatement: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Who must I become?</label>
              <Textarea
                value={goal.identityBecoming}
                onChange={(e) => updateGoal(index, { identityBecoming: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Financial target (optional)</label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={goal.financialTarget}
                onChange={(e) => updateGoal(index, { financialTarget: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Action plan steps</label>
              {goal.actionSteps.map((step, stepIndex) => (
                <div key={stepIndex} className="mb-2 grid gap-2 md:grid-cols-2">
                  <Input
                    placeholder="Step description"
                    value={step.description}
                    onChange={(e) => updateStep(index, stepIndex, { description: e.target.value })}
                  />
                  <Input
                    type="date"
                    value={step.deadline}
                    onChange={(e) => updateStep(index, stepIndex, { deadline: e.target.value })}
                  />
                </div>
              ))}
              <Button
                variant="ghost"
                onClick={() =>
                  updateGoal(index, {
                    actionSteps: [...goal.actionSteps, { description: "", deadline: "" }],
                  })
                }
              >
                Add step
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <Alert variant="info">
        Confirm exactly {PRIORITY_GOALS_REQUIRED} goals with unique ranks 1–4 before proceeding.
      </Alert>
      <Button onClick={saveGoals} className="w-full sm:w-auto">Save priority goals &amp; open dashboard</Button>
    </div>
  );
}
