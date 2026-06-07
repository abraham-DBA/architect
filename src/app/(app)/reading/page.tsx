"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { BOOK_STATUS_LABELS, BOOK_STATUSES } from "@/lib/constants";

type Book = {
  id: string;
  title: string;
  author: string;
  status: string;
  progressType: string | null;
  currentPage: number | null;
  totalPages: number | null;
  percentage: number | null;
  keyLessons: string | null;
  goal?: { id: string; statement: string } | null;
};

type Goal = { id: string; statement: string };

export default function ReadingPage() {
  const [grouped, setGrouped] = useState<Record<string, Book[]>>({
    NOT_STARTED: [],
    IN_PROGRESS: [],
    COMPLETED: [],
  });
  const [stats, setStats] = useState({ total: 0, completedThisYear: 0 });
  const [goals, setGoals] = useState<Goal[]>([]);

  async function load() {
    const [readingRes, goalsRes] = await Promise.all([
      fetch("/api/reading"),
      fetch("/api/priority-goals"),
    ]);
    const readingData = await readingRes.json();
    const goalsData = await goalsRes.json();
    setGrouped(readingData.grouped ?? { NOT_STARTED: [], IN_PROGRESS: [], COMPLETED: [] });
    setStats(readingData.stats ?? { total: 0, completedThisYear: 0 });
    setGoals(goalsData.goals ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const res = await fetch("/api/reading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        author: form.get("author"),
        goalId: form.get("goalId") || null,
        status: form.get("status"),
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Failed to add book");
      return;
    }
    formEl.reset();
    toast.success("Book added");
    await load();
  }

  async function updateBook(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/reading/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Failed to update book");
      return;
    }
    toast.success("Book updated");
    await load();
  }

  function bookProgress(book: Book) {
    if (book.progressType === "PAGE" && book.currentPage != null && book.totalPages) {
      return Math.round((book.currentPage / book.totalPages) * 100);
    }
    return book.percentage ?? 0;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Reading Tracker"
        description="Connect books to your growth goals and capture key lessons."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-stone-500">Total books</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-sm text-stone-500">Completed this year</p>
          <p className="text-3xl font-bold">{stats.completedThisYear}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">Add book</h2>
        <form onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input name="title" placeholder="Title" maxLength={500} required />
          <Input name="author" placeholder="Author" maxLength={200} required />
          <Select name="goalId" defaultValue="">
            <option value="">Link to goal (optional)</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>{goal.statement}</option>
            ))}
          </Select>
          <Select name="status" defaultValue="NOT_STARTED">
            {BOOK_STATUSES.map((s) => (
              <option key={s} value={s}>{BOOK_STATUS_LABELS[s]}</option>
            ))}
          </Select>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full sm:w-auto">Add book</Button>
          </div>
        </form>
      </Card>

      {stats.total === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No books yet"
          description="Add a book above and link it to a priority goal to track your reading progress."
        />
      ) : (
        BOOK_STATUSES.map((status) => (
          <section key={status} className="space-y-4">
            <h2 className="text-lg font-semibold">{BOOK_STATUS_LABELS[status]}</h2>
            {(grouped[status] ?? []).length === 0 ? (
              <Card className="text-sm text-stone-500">No books in this group.</Card>
            ) : (
              (grouped[status] ?? []).map((book) => (
                <Card key={book.id}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{book.title}</h3>
                      <p className="text-sm text-stone-500">by {book.author}</p>
                    </div>
                    <Badge>{BOOK_STATUS_LABELS[book.status]}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Select
                      value={book.status}
                      onChange={(e) => updateBook(book.id, { status: e.target.value })}
                    >
                      {BOOK_STATUSES.map((s) => (
                        <option key={s} value={s}>{BOOK_STATUS_LABELS[s]}</option>
                      ))}
                    </Select>
                    <Select
                      value={book.progressType ?? ""}
                      onChange={(e) =>
                        updateBook(book.id, {
                          progressType: e.target.value || null,
                        })
                      }
                    >
                      <option value="">Progress type</option>
                      <option value="PAGE">By page</option>
                      <option value="PERCENTAGE">By percentage</option>
                    </Select>
                    {book.progressType === "PAGE" ? (
                      <>
                        <Input
                          type="number"
                          placeholder="Current page"
                          defaultValue={book.currentPage ?? 0}
                          onBlur={(e) =>
                            updateBook(book.id, {
                              currentPage: Number(e.target.value),
                              totalPages: book.totalPages ?? 100,
                            })
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Total pages"
                          defaultValue={book.totalPages ?? 100}
                          onBlur={(e) =>
                            updateBook(book.id, {
                              totalPages: Number(e.target.value),
                              currentPage: book.currentPage ?? 0,
                            })
                          }
                        />
                      </>
                    ) : book.progressType === "PERCENTAGE" ? (
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Percentage"
                        defaultValue={book.percentage ?? 0}
                        onBlur={(e) =>
                          updateBook(book.id, { percentage: Number(e.target.value) })
                        }
                      />
                    ) : null}
                  </div>
                  {book.progressType && (
                    <div className="mt-4">
                      <ProgressBar value={bookProgress(book)} />
                    </div>
                  )}
                  <Textarea
                    className="mt-4"
                    placeholder="Key lessons (max 5000 characters)"
                    defaultValue={book.keyLessons ?? ""}
                    maxLength={5000}
                    rows={3}
                    onBlur={(e) => updateBook(book.id, { keyLessons: e.target.value })}
                  />
                </Card>
              ))
            )}
          </section>
        ))
      )}
    </div>
  );
}
