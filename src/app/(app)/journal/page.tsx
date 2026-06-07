"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [search, setSearch] = useState("");

  async function load(query = "") {
    const [journalRes, goalsRes] = await Promise.all([
      fetch(`/api/journal${query ? `?q=${encodeURIComponent(query)}` : ""}`),
      fetch("/api/priority-goals"),
    ]);
    const journalData = await journalRes.json();
    const goalsData = await goalsRes.json();
    setEntries(journalData.entries ?? []);
    setGoals(goalsData.goals ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
      return;
    }
    formEl.reset();
    toast.success("Journal entry saved");
    await load(search);
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Growth Journal"
        description="Capture insights, breakthroughs, and lessons along the way."
      />

      <Card>
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            placeholder="Search by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="secondary" onClick={() => load(search)}>Search</Button>
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
          <Textarea name="content" rows={6} maxLength={10000} required />
          <Button type="submit">Save entry</Button>
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
          entries.map((entry) => (
            <Card key={entry.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{entry.title}</h3>
                  <p className="mt-1 text-sm text-stone-500">
                    {format(new Date(entry.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
                <Badge>{JOURNAL_TAG_LABELS[entry.tag]}</Badge>
              </div>
              {entry.goal && (
                <p className="mt-2 text-sm text-amber-800">Linked: {entry.goal.statement}</p>
              )}
              <p className="mt-3 whitespace-pre-wrap text-sm text-stone-700">{entry.content}</p>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
