"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Lightbulb, Trash2, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { SkeletonPage } from "@/components/ui/skeleton";
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
  const [saving, setSaving] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewItems, setReviewItems] = useState<Accomplishment[]>([]);
  const [newContent, setNewContent] = useState("");
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/brain-dump");
    if (res.status === 403) {
      router.replace("/vault");
      return;
    }
    const data = await res.json();
    setEntries(data.entries ?? []);
    setLoading(false);
  }, [router]);

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
  }, [searchParams, load]);

  function addEntry() {
    if (!newContent.trim()) return;
    setEntries((prev) => [...prev, { content: newContent.trim(), category: null, timeHorizon: null }]);
    setNewContent("");
    toast.success("Aspiration added");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      addEntry();
    }
  }

  function updateEntry(index: number, patch: Partial<Entry>) {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  function confirmRemoveEntry() {
    if (deleteIndex === null) return;
    setEntries((prev) => prev.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);
    toast.success("Entry removed");
  }

  async function saveAll() {
    setSaving(true);
    const res = await fetch("/api/brain-dump", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Save was unsuccessful. Your entries are still in the form.");
      setSaving(false);
      return;
    }
    setEntries(data.entries);
    toast.success("Brain dump saved");
    setSaving(false);
  }

  async function skipBrainDump() {
    await fetch("/api/brain-dump/skip", { method: "POST" });
    toast.success("Brain dump skipped — you can return anytime");
    router.push("/priority-goals");
  }

  async function confirmReview() {
    await fetch("/api/vault/review-session", { method: "POST" });
    setShowReviewModal(false);
    toast.success("Accomplishments reviewed");
  }

  if (loading) {
    return <SkeletonPage />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Goal Brain Dump"
        description="Capture every aspiration before you narrow focus."
        actions={
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-accent-surface px-4 py-2 text-sm font-medium text-accent-foreground shadow-sm">
              {entries.length} captured
            </div>
          </div>
        }
      />

      <Card>
        <h2 className="text-lg font-semibold">Add aspiration</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write freely — e.g. Read 20 pages daily, save $10k, run a marathon..."
            rows={3}
            className="flex-1"
          />
          <div className="flex flex-col gap-2 shrink-0">
            <Button onClick={addEntry} className="w-full sm:w-auto">Add entry</Button>
            <p className="text-[10px] text-muted text-center hidden sm:block">⌘+Enter to add</p>
          </div>
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
            <Card key={entry.id ?? `new-${index}`} className="animate-fade-in-up" style={{ animationDelay: `${index * 40}ms` }}>
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
                <Button
                  variant="ghost"
                  className="w-full sm:col-span-2 lg:col-span-1 text-danger hover:bg-danger-surface hover:text-danger gap-1.5"
                  onClick={() => setDeleteIndex(index)}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={saveAll} loading={saving} className="w-full sm:w-auto">
          {saving ? "Saving…" : "Save progress"}
        </Button>
        <Button variant="secondary" className="w-full sm:w-auto" onClick={() => router.push("/priority-goals")}>
          Continue to Priority Goals
        </Button>
        <Button variant="ghost" className="w-full sm:w-auto gap-1.5" onClick={skipBrainDump}>
          <SkipForward className="h-4 w-4" />
          Skip for now
        </Button>
      </div>

      {/* Remove confirmation dialog */}
      <AlertDialog
        open={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        title="Remove entry?"
        description="This will remove the aspiration from your brain dump."
        cancelText="Cancel"
        actionText="Remove"
        onAction={confirmRemoveEntry}
        variant="destructive"
      />

      {/* Accomplishments review dialog */}
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
