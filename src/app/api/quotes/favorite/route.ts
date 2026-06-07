import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAuth, jsonError } from "@/lib/api-helpers";

const schema = z.object({
  quoteId: z.string(),
  favorite: z.boolean(),
});

export async function POST(request: Request) {
  return withAuth(async (userId) => {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid request");

    if (parsed.data.favorite) {
      await prisma.userQuoteFavorite.upsert({
        where: { userId_quoteId: { userId, quoteId: parsed.data.quoteId } },
        create: { userId, quoteId: parsed.data.quoteId },
        update: {},
      });
    } else {
      await prisma.userQuoteFavorite.deleteMany({
        where: { userId, quoteId: parsed.data.quoteId },
      });
    }

    return NextResponse.json({ ok: true, favorite: parsed.data.favorite });
  });
}
