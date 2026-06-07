"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { OnboardingProgress } from "@/components/onboarding-progress";
import {
  ACCOMPLISHMENTS_REQUIRED,
  CATEGORY_LABELS,
  LIFE_CATEGORIES,
} from "@/lib/constants";
import { format } from "date-fns";

type Accomplishment = {
  id: string;
  title: string;
  description: string;
  dateAchieved: string;
  category: string;
};

export default function VaultPage() {
  const router = useRouter();
  const [items, setItems] = useState<Accomplishment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState<{
    steps: { id: string; label: string; complete: boolean; optional?: boolean }[];
  } | null>(null);

  async function load(pageNum = 1) {
    const [res, onboardingRes] = await Promise.all([
      fetch(`/api/accomplishments?page=${pageNum}`),
      fetch("/api/onboarding"),
    ]);
    const data = await res.json();
    const onboardingData = await onboardingRes.json();
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
    setPage(data.page ?? 1);
    setTotalPages(data.totalPages ?? 1);
    setOnboarding(onboardingData.onboarding);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const res = await fetch("/api/accomplishments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        dateAchieved: form.get("dateAchieved"),
        category: form.get("category"),
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Failed to save accomplishment");
      return;
    }
    formEl.reset();
    toast.success("Accomplishment saved");
    await load(page);
  }

  const needsMore = total < ACCOMPLISHMENTS_REQUIRED;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-stone-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-stone-100" />
        <div className="h-40 animate-pulse rounded-xl bg-stone-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Accomplishments Vault"
        description="Log past wins to build belief before setting new goals."
        actions={
          !needsMore ? (
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => router.push("/brain-dump?review=1")}
            >
              Continue to Brain Dump
            </Button>
          ) : undefined
        }
      />

      {onboarding && <OnboardingProgress steps={onboarding.steps} />}

      {needsMore && (
        <Alert variant="warning">
          Add {ACCOMPLISHMENTS_REQUIRED - total} more accomplishment
          {ACCOMPLISHMENTS_REQUIRED - total === 1 ? "" : "s"} to unlock Brain Dump.
        </Alert>
      )}

      <Card>
        <h2 className="text-lg font-semibold">Add accomplishment</h2>
        <form onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Title</label>
              <Input name="title" maxLength={100} required placeholder="e.g. Finished my first 5K" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Date achieved</label>
              <Input name="dateAchieved" type="date" required />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Category</label>
            <Select name="category" required defaultValue="SKILLS">
              {LIFE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <Textarea
              name="description"
              maxLength={2000}
              rows={4}
              required
              placeholder="What did you achieve and why does it matter?"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full sm:w-auto">Save accomplishment</Button>
          </div>
        </form>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Your vault ({total})</h2>

        {items.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No accomplishments yet"
            description="Start with any win — big or small. You need 3 before moving to Brain Dump."
          />
        ) : (
          items.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold break-words">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {format(new Date(item.dateAchieved), "MMMM d, yyyy")}
                  </p>
                </div>
                <Badge>{CATEGORY_LABELS[item.category]}</Badge>
              </div>
              <p className="mt-3 text-sm text-foreground/80">{item.description}</p>
            </Card>
          ))
        )}

        {totalPages > 1 && (
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1 sm:flex-none" disabled={page <= 1} onClick={() => load(page - 1)}>
              Previous
            </Button>
            <Button variant="secondary" className="flex-1 sm:flex-none" disabled={page >= totalPages} onClick={() => load(page + 1)}>
              Next
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
