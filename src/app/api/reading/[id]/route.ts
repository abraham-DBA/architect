import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAuth, jsonError } from "@/lib/api-helpers";
import { BOOK_STATUSES } from "@/lib/constants";

const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  author: z.string().min(1).max(200).optional(),
  goalId: z.string().nullable().optional(),
  status: z.enum(BOOK_STATUSES).optional(),
  progressType: z.enum(["PAGE", "PERCENTAGE"]).nullable().optional(),
  currentPage: z.number().int().min(0).nullable().optional(),
  totalPages: z.number().int().min(0).nullable().optional(),
  percentage: z.number().int().min(0).max(100).nullable().optional(),
  keyLessons: z.string().max(5000).nullable().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const existing = await prisma.book.findFirst({ where: { id, userId } });
    if (!existing) return jsonError("Not found", 404);

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid book data");

    const merged = {
      progressType: parsed.data.progressType ?? existing.progressType,
      currentPage: parsed.data.currentPage ?? existing.currentPage,
      totalPages: parsed.data.totalPages ?? existing.totalPages,
      percentage: parsed.data.percentage ?? existing.percentage,
    };

    if (merged.progressType === "PAGE" && merged.currentPage != null && merged.totalPages != null) {
      if (merged.currentPage < 0 || merged.currentPage > merged.totalPages) {
        return jsonError("Page number must be between 0 and total pages");
      }
    }
    if (merged.progressType === "PERCENTAGE" && merged.percentage != null) {
      if (merged.percentage < 0 || merged.percentage > 100) {
        return jsonError("Percentage must be between 0 and 100");
      }
    }

    const book = await prisma.book.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(book);
  });
}
