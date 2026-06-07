import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAuth, jsonError } from "@/lib/api-helpers";
import { LIFE_CATEGORIES, TIME_HORIZONS } from "@/lib/constants";
import { ACCOMPLISHMENTS_REQUIRED } from "@/lib/constants";

const entrySchema = z.object({
  id: z.string().optional(),
  content: z.string().min(1),
  category: z.enum(LIFE_CATEGORIES).nullable().optional(),
  timeHorizon: z.enum(TIME_HORIZONS).nullable().optional(),
});

const saveSchema = z.object({
  entries: z.array(entrySchema),
});

export async function GET() {
  return withAuth(async (userId) => {
    const count = await prisma.accomplishment.count({ where: { userId } });
    if (count < ACCOMPLISHMENTS_REQUIRED) {
      return jsonError("Add at least 3 accomplishments before accessing Brain Dump", 403);
    }

    const entries = await prisma.brainDumpEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ entries, total: entries.length });
  });
}

export async function POST(request: Request) {
  return withAuth(async (userId) => {
    const count = await prisma.accomplishment.count({ where: { userId } });
    if (count < ACCOMPLISHMENTS_REQUIRED) {
      return jsonError("Add at least 3 accomplishments before saving Brain Dump", 403);
    }

    const body = await request.json();
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid brain dump data");

    try {
      await prisma.$transaction(async (tx) => {
        const existing = await tx.brainDumpEntry.findMany({ where: { userId } });
        const incomingIds = new Set(
          parsed.data.entries.map((e) => e.id).filter(Boolean) as string[]
        );

        const toDelete = existing.filter((e) => !incomingIds.has(e.id));
        if (toDelete.length > 0) {
          await tx.brainDumpEntry.deleteMany({
            where: { id: { in: toDelete.map((e) => e.id) } },
          });
        }

        for (const entry of parsed.data.entries) {
          if (entry.id) {
            await tx.brainDumpEntry.updateMany({
              where: { id: entry.id, userId },
              data: {
                content: entry.content,
                category: entry.category ?? null,
                timeHorizon: entry.timeHorizon ?? null,
              },
            });
          } else {
            await tx.brainDumpEntry.create({
              data: {
                userId,
                content: entry.content,
                category: entry.category ?? null,
                timeHorizon: entry.timeHorizon ?? null,
              },
            });
          }
        }
      });

      const entries = await prisma.brainDumpEntry.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });

      return NextResponse.json({ entries, total: entries.length });
    } catch {
      return jsonError("Save failed. Your entries were not persisted.", 500);
    }
  });
}
