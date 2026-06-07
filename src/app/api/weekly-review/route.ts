import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAuth, jsonError } from "@/lib/api-helpers";
import { GOAL_STATUSES } from "@/lib/constants";
import { stripWhitespaceLength } from "@/lib/utils";
import { endGoalSettingSession, getWeeklyReviewMeta } from "@/lib/user-state";

const goalStatusSchema = z.object({
  goalId: z.string(),
  status: z.enum(GOAL_STATUSES),
});

const rankSchema = z.object({
  goalId: z.string(),
  rank: z.number().int().min(1).max(4),
});

const createSchema = z.object({
  progressAnswer: z.string(),
  adjustAnswer: z.string(),
  becomeAnswer: z.string(),
  goalStatuses: z.array(goalStatusSchema),
  ranks: z.array(rankSchema).length(4),
});

export async function GET() {
  return withAuth(async (userId) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return jsonError("User not found", 404);

    const reviews = await prisma.weeklyReview.findMany({
      where: { userId },
      include: {
        goalStatuses: true,
        rankChanges: true,
      },
      orderBy: { completedAt: "asc" },
    });

    const meta = await getWeeklyReviewMeta(userId, user.createdAt);
    return NextResponse.json({ reviews, ...meta });
  });
}

export async function POST(request: Request) {
  return withAuth(async (userId) => {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid weekly review data");

    for (const field of [
      parsed.data.progressAnswer,
      parsed.data.adjustAnswer,
      parsed.data.becomeAnswer,
    ]) {
      if (stripWhitespaceLength(field) < 10) {
        return jsonError("Each answer must be at least 10 characters");
      }
    }

    const ranks = parsed.data.ranks.map((r) => r.rank).sort();
    if (ranks.join(",") !== "1,2,3,4") {
      return jsonError("Ranking values 1, 2, 3, and 4 must each be used exactly once");
    }

    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.weeklyReview.create({
        data: {
          userId,
          progressAnswer: parsed.data.progressAnswer,
          adjustAnswer: parsed.data.adjustAnswer,
          becomeAnswer: parsed.data.becomeAnswer,
          goalStatuses: {
            create: parsed.data.goalStatuses.map((gs) => ({
              goalId: gs.goalId,
              status: gs.status,
            })),
          },
          rankChanges: {
            create: parsed.data.ranks.map((r) => ({
              goalId: r.goalId,
              rank: r.rank,
            })),
          },
        },
        include: { goalStatuses: true, rankChanges: true },
      });

      for (const rankChange of parsed.data.ranks) {
        await tx.priorityGoal.updateMany({
          where: { id: rankChange.goalId, userId },
          data: { rank: rankChange.rank },
        });
      }

      for (const gs of parsed.data.goalStatuses) {
        await tx.priorityGoal.updateMany({
          where: { id: gs.goalId, userId },
          data: { status: gs.status },
        });
      }

      return created;
    });

    await endGoalSettingSession(userId);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const meta = user ? await getWeeklyReviewMeta(userId, user.createdAt) : { streak: 1 };

    return NextResponse.json({ review, streak: meta.streak }, { status: 201 });
  });
}
