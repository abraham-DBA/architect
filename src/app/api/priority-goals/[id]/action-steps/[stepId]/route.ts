import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAuth, jsonError } from "@/lib/api-helpers";

const updateSchema = z.object({
  done: z.boolean().optional(),
  description: z.string().min(1).optional(),
  deadline: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  return withAuth(async (userId) => {
    const { id, stepId } = await params;
    const goal = await prisma.priorityGoal.findFirst({ where: { id, userId } });
    if (!goal) return jsonError("Goal not found", 404);

    const step = await prisma.actionStep.findFirst({ where: { id: stepId, goalId: id } });
    if (!step) return jsonError("Step not found", 404);

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid step data");

    const updated = await prisma.actionStep.update({
      where: { id: stepId },
      data: {
        done: parsed.data.done ?? step.done,
        description: parsed.data.description ?? step.description,
        deadline:
          parsed.data.deadline === undefined
            ? step.deadline
            : parsed.data.deadline
              ? new Date(parsed.data.deadline)
              : null,
        sortOrder: parsed.data.sortOrder ?? step.sortOrder,
        completedAt:
          parsed.data.done === true
            ? new Date()
            : parsed.data.done === false
              ? null
              : step.completedAt,
      },
    });

    return NextResponse.json(updated);
  });
}
