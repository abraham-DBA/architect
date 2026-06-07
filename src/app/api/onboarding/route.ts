import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-helpers";
import { getUserOnboardingState, getGoalSettingSessionState } from "@/lib/user-state";

export async function GET() {
  return withAuth(async (userId) => {
    const [onboarding, session] = await Promise.all([
      getUserOnboardingState(userId),
      getGoalSettingSessionState(userId),
    ]);
    return NextResponse.json({ onboarding, session });
  });
}
