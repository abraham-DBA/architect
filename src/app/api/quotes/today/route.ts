import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-helpers";
import { getQuoteOfTheDay } from "@/lib/quotes";

export async function GET() {
  return withAuth(async (userId) => {
    const result = await getQuoteOfTheDay(userId);
    return NextResponse.json(result);
  });
}
