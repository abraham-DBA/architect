import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function withAuth(handler: (userId: string) => Promise<NextResponse>) {
  const user = await requireUser();
  if (!user) {
    return jsonError("Unauthorized", 401);
  }
  return handler(user.id);
}
