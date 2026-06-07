import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAuth, jsonError } from "@/lib/api-helpers";
import { LIFE_CATEGORIES } from "@/lib/constants";

const updateSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(2000),
  dateAchieved: z.string(),
  category: z.enum(LIFE_CATEGORIES),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid accomplishment data");

    const existing = await prisma.accomplishment.findFirst({ where: { id, userId } });
    if (!existing) return jsonError("Not found", 404);

    const item = await prisma.accomplishment.update({
      where: { id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        dateAchieved: new Date(parsed.data.dateAchieved),
        category: parsed.data.category,
      },
    });

    return NextResponse.json(item);
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const existing = await prisma.accomplishment.findFirst({ where: { id, userId } });
    if (!existing) return jsonError("Not found", 404);

    await prisma.accomplishment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
