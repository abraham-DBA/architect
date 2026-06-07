import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAuth, jsonError } from "@/lib/api-helpers";
import { ACCOMPLISHMENTS_PER_PAGE, LIFE_CATEGORIES } from "@/lib/constants";

const createSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(2000),
  dateAchieved: z.string(),
  category: z.enum(LIFE_CATEGORIES),
});

export async function GET(request: Request) {
  return withAuth(async (userId) => {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const skip = (page - 1) * ACCOMPLISHMENTS_PER_PAGE;

    const [items, total] = await Promise.all([
      prisma.accomplishment.findMany({
        where: { userId },
        orderBy: { dateAchieved: "desc" },
        skip,
        take: ACCOMPLISHMENTS_PER_PAGE,
      }),
      prisma.accomplishment.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pageSize: ACCOMPLISHMENTS_PER_PAGE,
      totalPages: Math.ceil(total / ACCOMPLISHMENTS_PER_PAGE),
    });
  });
}

export async function POST(request: Request) {
  return withAuth(async (userId) => {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid accomplishment data");

    const item = await prisma.accomplishment.create({
      data: {
        userId,
        title: parsed.data.title,
        description: parsed.data.description,
        dateAchieved: new Date(parsed.data.dateAchieved),
        category: parsed.data.category,
      },
    });

    return NextResponse.json(item, { status: 201 });
  });
}
