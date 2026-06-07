import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAuth, jsonError } from "@/lib/api-helpers";
import {
  calculateProjectedCompletionDate,
  calculateSavingsProgress,
  decimalToNumber,
} from "@/lib/utils";

const targetSchema = z.object({
  financialTarget: z.number().min(0.01).max(999999999.99),
});

const contributionSchema = z.object({
  amount: z.number().min(0.01),
  date: z.string(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const goal = await prisma.priorityGoal.findFirst({
      where: { id, userId },
      include: { savingsContributions: { orderBy: { date: "asc" } } },
    });
    if (!goal) return jsonError("Goal not found", 404);

    const target = decimalToNumber(goal.financialTarget);
    const totalSaved = goal.savingsContributions.reduce(
      (sum, c) => sum + decimalToNumber(c.amount),
      0
    );
    const progress = calculateSavingsProgress(totalSaved, target);
    const projectedDate =
      target > 0
        ? calculateProjectedCompletionDate(
            goal.savingsContributions.map((c) => ({
              date: c.date,
              amount: decimalToNumber(c.amount),
            })),
            target,
            totalSaved
          )
        : null;

    return NextResponse.json({
      target,
      totalSaved,
      ...progress,
      projectedDate,
      contributions: goal.savingsContributions,
    });
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const goal = await prisma.priorityGoal.findFirst({ where: { id, userId } });
    if (!goal) return jsonError("Goal not found", 404);

    const body = await request.json();
    const parsed = targetSchema.safeParse(body);
    if (!parsed.success) return jsonError("Target must be between $0.01 and $999,999,999.99");

    const updated = await prisma.priorityGoal.update({
      where: { id },
      data: { financialTarget: parsed.data.financialTarget },
    });

    return NextResponse.json(updated);
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const goal = await prisma.priorityGoal.findFirst({ where: { id, userId } });
    if (!goal) return jsonError("Goal not found", 404);

    if (!goal.financialTarget) {
      return jsonError("Set a financial target before logging contributions");
    }

    const body = await request.json();
    const parsed = contributionSchema.safeParse(body);
    if (!parsed.success) return jsonError("Contribution must be at least $0.01");

    const contribution = await prisma.savingsContribution.create({
      data: {
        goalId: id,
        amount: parsed.data.amount,
        date: new Date(parsed.data.date),
      },
    });

    return NextResponse.json(contribution, { status: 201 });
  });
}
