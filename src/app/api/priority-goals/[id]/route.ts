import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAuth, jsonError } from "@/lib/api-helpers";
import { LIFE_CATEGORIES, TIME_HORIZONS } from "@/lib/constants";
import { stripWhitespaceLength } from "@/lib/utils";

const actionStepSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1),
  deadline: z.string().nullable().optional(),
  done: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

const updateSchema = z.object({
  statement: z.string().min(1),
  category: z.enum(LIFE_CATEGORIES),
  timeHorizon: z.enum(TIME_HORIZONS),
  whyStatement: z.string(),
  identityBecoming: z.string(),
  financialTarget: z.number().min(0.01).max(999999999.99).nullable().optional(),
  actionSteps: z.array(actionStepSchema).max(50),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const goal = await prisma.priorityGoal.findFirst({
      where: { id, userId },
      include: {
        actionSteps: { orderBy: { sortOrder: "asc" } },
        savingsContributions: { orderBy: { date: "desc" } },
      },
    });
    if (!goal) return jsonError("Not found", 404);
    return NextResponse.json(goal);
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const existing = await prisma.priorityGoal.findFirst({ where: { id, userId } });
    if (!existing) return jsonError("Not found", 404);

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid goal data");

    if (stripWhitespaceLength(parsed.data.whyStatement) < 10) {
      return jsonError("WHY statement must be at least 10 characters");
    }
    if (stripWhitespaceLength(parsed.data.identityBecoming) < 10) {
      return jsonError("Identity Becoming statement must be at least 10 characters");
    }

    await prisma.$transaction(async (tx) => {
      await tx.priorityGoal.update({
        where: { id },
        data: {
          statement: parsed.data.statement,
          category: parsed.data.category,
          timeHorizon: parsed.data.timeHorizon,
          whyStatement: parsed.data.whyStatement,
          identityBecoming: parsed.data.identityBecoming,
          financialTarget: parsed.data.financialTarget ?? null,
        },
      });

      await tx.actionStep.deleteMany({ where: { goalId: id } });
      if (parsed.data.actionSteps.length > 0) {
        await tx.actionStep.createMany({
          data: parsed.data.actionSteps.map((step, index) => ({
            goalId: id,
            description: step.description,
            deadline: step.deadline ? new Date(step.deadline) : null,
            done: step.done ?? false,
            sortOrder: step.sortOrder ?? index,
            completedAt: step.done ? new Date() : null,
          })),
        });
      }
    });

    const goal = await prisma.priorityGoal.findUnique({
      where: { id },
      include: {
        actionSteps: { orderBy: { sortOrder: "asc" } },
        savingsContributions: { orderBy: { date: "desc" } },
      },
    });

    return NextResponse.json(goal);
  });
}
