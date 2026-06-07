"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import {
  CATEGORY_LABELS,
  HORIZON_LABELS,
  LIFE_CATEGORIES,
  TIME_HORIZONS,
} from "@/lib/constants";

type Entry = {
  id?: string;
  content: string;
  category: string | null;
  timeHorizon: string | null;
};

type Accomplishment = {
  id: string;
  title: string;
  description: string;
  category: string;
};

export function BrainDumpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewItems, setReviewItems] = useState<Accomplishment[]>([]);
  const [newContent, setNewContent] = useState("");

  async function load() {
    const res = await fetch("/api/brain-dump");
    if (res.status === 403) {
      router.replace("/vault");
      return;
    }
    const data = await res.json();
    setEntries(data.entries ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    if (searchParams.get("review") === "1") {
      fetch("/api/accomplishments?page=1")
        .then((r) => r.json())
        .then((data) => {
          setReviewItems((data.items ?? []).slice(0, 3));
          setShowReviewModal(true);
        });
    }
  }, [searchParams, router]);

  function addEntry() {
    if (!newContent.trim()) return;
    setEntries((prev) => [...prev, { content: newContent.trim(), category: null, timeHorizon: null }]);
    setNewContent("");
    toast.success("Aspiration added");
  }

  function updateEntry(index: number, patch: Partial<Entry>) {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index));
    toast.success("Entry removed");
  }

  async function saveAll() {
    const res = await fetch("/api/brain-dump", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Save was unsuccessful. Your entries are still in the form.");
      return;
    }
    setEntries(data.entries);
    toast.success("Brain dump saved");
  }

  async function confirmReview() {
    await fetch("/api/vault/review-session", { method: "POST" });
    setShowReviewModal(false);
    toast.success("Accomplishments reviewed");
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-stone-200" />
        <div className="h-40 animate-pulse rounded-xl bg-stone-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Goal Brain Dump"
        description="Capture every aspiration before you narrow focus."
        actions={
          <div className="rounded-lg bg-accent-surface px-4 py-2 text-sm font-medium text-accent-foreground">
            {entries.length} captured
          </div>
        }
      />

      <Card>
        <h2 className="text-lg font-semibold">Add aspiration</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Write freely — e.g. Read 20 pages daily, save $10k, run a marathon..."
            rows={3}
            className="flex-1"
          />
          <Button onClick={addEntry} className="w-full shrink-0 sm:w-auto">Add entry</Button>
        </div>
      </Card>

      {entries.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="Start your brain dump"
          description="Don't filter yourself. Write everything you want across all areas of life."
        />
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <Card key={entry.id ?? `new-${index}`}>
              <Textarea
                value={entry.content}
                onChange={(e) => updateEntry(index, { content: e.target.value })}
                rows={2}
              />
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Select
                  value={entry.category ?? ""}
                  onChange={(e) => updateEntry(index, { category: e.target.value || null })}
                >
                  <option value="">Life category</option>
                  {LIFE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </Select>
                <Select
                  value={entry.timeHorizon ?? ""}
                  onChange={(e) => updateEntry(index, { timeHorizon: e.target.value || null })}
                >
                  <option value="">Time horizon</option>
                  {TIME_HORIZONS.map((h) => (
                    <option key={h} value={h}>{HORIZON_LABELS[h]}</option>
                  ))}
                </Select>
                <Button variant="ghost" className="w-full sm:col-span-2 lg:col-span-1" onClick={() => removeEntry(index)}>
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={saveAll} className="w-full sm:w-auto">Save progress</Button>
        <Button variant="secondary" className="w-full sm:w-auto" onClick={() => router.push("/priority-goals")}>
          Continue to Priority Goals
        </Button>
      </div>

      <Dialog
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Review your accomplishments"
        description="Before brain dumping, review these 3 wins from your vault."
      >
        <div className="space-y-3">
          {reviewItems.map((item) => (
            <div key={item.id} className="rounded-lg border border-border p-4">
              <h3 className="font-medium">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.description}</p>
            </div>
          ))}
        </div>
        <Button className="mt-6 w-full" onClick={confirmReview}>
          I&apos;ve reviewed my accomplishments
        </Button>
      </Dialog>
    </div>
  );
}
