import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAuth, jsonError } from "@/lib/api-helpers";
import { LIFE_CATEGORIES, TIME_HORIZONS, PRIORITY_GOALS_REQUIRED } from "@/lib/constants";
import { stripWhitespaceLength } from "@/lib/utils";
import { startGoalSettingSession } from "@/lib/user-state";

const actionStepSchema = z.object({
  description: z.string().min(1),
  deadline: z.string().nullable().optional(),
});

const goalSchema = z.object({
  brainDumpEntryId: z.string().optional(),
  statement: z.string().min(1),
  category: z.enum(LIFE_CATEGORIES),
  timeHorizon: z.enum(TIME_HORIZONS),
  rank: z.number().int().min(1).max(4),
  whyStatement: z.string(),
  identityBecoming: z.string(),
  financialTarget: z.number().min(0.01).max(999999999.99).nullable().optional(),
  actionSteps: z.array(actionStepSchema).min(1).max(50),
});

const saveSchema = z.object({
  goals: z.array(goalSchema).length(PRIORITY_GOALS_REQUIRED),
});

export async function GET() {
  return withAuth(async (userId) => {
    const goals = await prisma.priorityGoal.findMany({
      where: { userId },
      include: {
        actionSteps: { orderBy: { sortOrder: "asc" } },
        savingsContributions: { orderBy: { date: "asc" } },
      },
      orderBy: { rank: "asc" },
    });
    return NextResponse.json({ goals });
  });
}

export async function POST(request: Request) {
  return withAuth(async (userId) => {
    const body = await request.json();
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(`Exactly ${PRIORITY_GOALS_REQUIRED} priority goals are required`);
    }

    const ranks = parsed.data.goals.map((g) => g.rank).sort();
    if (ranks.join(",") !== "1,2,3,4") {
      return jsonError("Ranking values 1, 2, 3, and 4 must each be used exactly once");
    }

    for (const goal of parsed.data.goals) {
      if (stripWhitespaceLength(goal.whyStatement) < 10) {
        return jsonError("WHY statement must be at least 10 characters");
      }
      if (stripWhitespaceLength(goal.identityBecoming) < 10) {
        return jsonError("Identity Becoming statement must be at least 10 characters");
      }
      if (goal.actionSteps.length < 1) {
        return jsonError("Each goal requires at least 1 action plan step");
      }
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.priorityGoal.deleteMany({ where: { userId } });

        for (const goal of parsed.data.goals) {
          await tx.priorityGoal.create({
            data: {
              userId,
              brainDumpEntryId: goal.brainDumpEntryId,
              statement: goal.statement,
              category: goal.category,
              timeHorizon: goal.timeHorizon,
              rank: goal.rank,
              whyStatement: goal.whyStatement,
              identityBecoming: goal.identityBecoming,
              financialTarget: goal.financialTarget ?? null,
              actionSteps: {
                create: goal.actionSteps.map((step, index) => ({
                  description: step.description,
                  deadline: step.deadline ? new Date(step.deadline) : null,
                  sortOrder: index,
                })),
              },
            },
          });
        }
      });

      await startGoalSettingSession(userId);

      const goals = await prisma.priorityGoal.findMany({
        where: { userId },
        include: { actionSteps: { orderBy: { sortOrder: "asc" } } },
        orderBy: { rank: "asc" },
      });

      return NextResponse.json({ goals });
    } catch {
      return jsonError("Failed to save priority goals", 500);
    }
  });
}
