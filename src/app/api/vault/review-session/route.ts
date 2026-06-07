import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-helpers";
import { markVaultReviewedInSession } from "@/lib/user-state";

export async function POST() {
  return withAuth(async (userId) => {
    await markVaultReviewedInSession(userId);
    return NextResponse.json({ ok: true });
  });
}
