import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/api-helpers";

export async function POST() {
  return withAuth(async (userId) => {
    await prisma.userPreferences.upsert({
      where: { userId },
      create: { userId, brainDumpSkipped: true },
      update: { brainDumpSkipped: true },
    });
    return NextResponse.json({ success: true });
  });
}
