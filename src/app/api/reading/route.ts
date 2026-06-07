import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAuth, jsonError } from "@/lib/api-helpers";
import { BOOK_STATUSES } from "@/lib/constants";

const createSchema = z.object({
  title: z.string().min(1).max(500),
  author: z.string().min(1).max(200),
  goalId: z.string().nullable().optional(),
  status: z.enum(BOOK_STATUSES).optional(),
  progressType: z.enum(["PAGE", "PERCENTAGE"]).nullable().optional(),
  currentPage: z.number().int().min(0).nullable().optional(),
  totalPages: z.number().int().min(0).nullable().optional(),
  percentage: z.number().int().min(0).max(100).nullable().optional(),
  keyLessons: z.string().max(5000).nullable().optional(),
});

function validateProgress(data: z.infer<typeof createSchema>) {
  if (data.progressType === "PAGE") {
    if (data.currentPage == null || data.totalPages == null) return null;
    if (data.currentPage < 0 || data.currentPage > data.totalPages) {
      return "Page number must be between 0 and total pages";
    }
  }
  if (data.progressType === "PERCENTAGE" && data.percentage != null) {
    if (data.percentage < 0 || data.percentage > 100) {
      return "Percentage must be between 0 and 100";
    }
  }
  return null;
}

export async function GET() {
  return withAuth(async (userId) => {
    const books = await prisma.book.findMany({
      where: { userId },
      include: { goal: { select: { id: true, statement: true } } },
      orderBy: { updatedAt: "desc" },
    });

    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const completedThisYear = books.filter(
      (b) => b.status === "COMPLETED" && b.updatedAt >= yearStart
    ).length;

    const grouped = {
      NOT_STARTED: books.filter((b) => b.status === "NOT_STARTED"),
      IN_PROGRESS: books.filter((b) => b.status === "IN_PROGRESS"),
      COMPLETED: books.filter((b) => b.status === "COMPLETED"),
    };

    return NextResponse.json({
      books,
      grouped,
      stats: { total: books.length, completedThisYear },
    });
  });
}

export async function POST(request: Request) {
  return withAuth(async (userId) => {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid book data");

    const progressError = validateProgress(parsed.data);
    if (progressError) return jsonError(progressError);

    const book = await prisma.book.create({
      data: {
        userId,
        title: parsed.data.title,
        author: parsed.data.author,
        goalId: parsed.data.goalId ?? null,
        status: parsed.data.status ?? "NOT_STARTED",
        progressType: parsed.data.progressType ?? null,
        currentPage: parsed.data.currentPage ?? null,
        totalPages: parsed.data.totalPages ?? null,
        percentage: parsed.data.percentage ?? null,
        keyLessons: parsed.data.keyLessons ?? null,
      },
    });

    return NextResponse.json(book, { status: 201 });
  });
}
