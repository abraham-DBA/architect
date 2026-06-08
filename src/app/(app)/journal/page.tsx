"use client";

import { FormEvent, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { NotebookPen, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { SkeletonPage } from "@/components/ui/skeleton";
import { JOURNAL_TAG_LABELS, JOURNAL_TAGS } from "@/lib/constants";
import { format } from "date-fns";

type Entry = {
  id: string;
  title: string;
  content: string;
  tag: string;
  createdAt: string;
  goal?: { id: string; statement: string } | null;
};

type Goal = { id: string; statement: string };

const TAG_BADGE_VARIANT: Record<string, "default" | "success" | "info" | "warning" | "neutral"> = {
  INSIGHT: "info",
  BREAKTHROUGH: "success",
  LESSON: "warning",
  GENERAL: "neutral",
};

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const load = useCallback(async (query = "") => {
    const [journalRes, goalsRes] = await Promise.all([
      fetch(`/api/journal${query ? `?q=${encodeURIComponent(query)}` : ""}`),
      fetch("/api/priority-goals"),
    ]);
    const journalData = await journalRes.json();
    const goalsData = await goalsRes.json();
    setEntries(journalData.entries ?? []);
    setGoals(goalsData.goals ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      load(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, load]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        content: form.get("content"),
        tag: form.get("tag"),
        goalId: form.get("goalId") || null,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Failed to save entry");
      setSaving(false);
      return;
    }
    formEl.reset();
    toast.success("Journal entry saved");
    setSaving(false);
    await load(search);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/journal/${deleteTarget}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete entry");
      return;
    }
    setDeleteTarget(null);
    toast.success("Entry deleted");
    await load(search);
  }

  if (loading) {
    return <SkeletonPage />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Growth Journal"
        description="Capture insights, breakthroughs, and lessons along the way."
      />

      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            placeholder="Search entries…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">New entry</h2>
        <form onSubmit={onSubmit} className="mt-4 grid gap-4">
          <Input name="title" placeholder="Title" maxLength={200} required />
          <div className="grid gap-4 md:grid-cols-2">
            <Select name="tag" defaultValue="GENERAL">
              {JOURNAL_TAGS.map((tag) => (
                <option key={tag} value={tag}>{JOURNAL_TAG_LABELS[tag]}</option>
              ))}
            </Select>
            <Select name="goalId" defaultValue="">
              <option value="">Link to goal (optional)</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>{goal.statement}</option>
              ))}
            </Select>
          </div>
          <Textarea name="content" rows={6} maxLength={10000} placeholder="Write your thoughts…" required />
          <Button type="submit" loading={saving} className="w-full sm:w-auto">
            {saving ? "Saving…" : "Save entry"}
          </Button>
        </form>
      </Card>

      <section className="space-y-4">
        {entries.length === 0 ? (
          <EmptyState
            icon={NotebookPen}
            title={search ? "No matching entries" : "No journal entries yet"}
            description={search ? "Try a different search term." : "Log your first insight, breakthrough, or lesson."}
          />
        ) : (
          entries.map((entry, index) => (
            <Card
              key={entry.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{entry.title}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {format(new Date(entry.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={TAG_BADGE_VARIANT[entry.tag] ?? "default"}>
                    {JOURNAL_TAG_LABELS[entry.tag]}
                  </Badge>
                  <button
                    onClick={() => setDeleteTarget(entry.id)}
                    className="rounded-lg p-1.5 text-muted hover:text-danger hover:bg-danger-surface transition-colors"
                    aria-label={`Delete ${entry.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {entry.goal && (
                <p className="mt-2 text-sm text-primary font-medium">Linked: {entry.goal.statement}</p>
              )}
              <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/80 leading-relaxed">{entry.content}</p>
            </Card>
          ))
        )}
      </section>

      <AlertDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete journal entry?"
        description="This action cannot be undone."
        cancelText="Cancel"
        actionText="Delete"
        onAction={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
