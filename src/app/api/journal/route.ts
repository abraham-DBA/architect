import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAuth, jsonError } from "@/lib/api-helpers";
import { JOURNAL_TAGS } from "@/lib/constants";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(10000),
  tag: z.enum(JOURNAL_TAGS),
  goalId: z.string().nullable().optional(),
});

export async function GET(request: Request) {
  return withAuth(async (userId) => {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    const entries = await prisma.journalEntry.findMany({
      where: {
        userId,
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { content: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { goal: { select: { id: true, statement: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ entries });
  });
}

export async function POST(request: Request) {
  return withAuth(async (userId) => {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid journal entry");

    const entry = await prisma.journalEntry.create({
      data: {
        userId,
        title: parsed.data.title,
        content: parsed.data.content,
        tag: parsed.data.tag,
        goalId: parsed.data.goalId ?? null,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  });
}
