import { prisma } from "@/lib/db";
import { ACCOMPLISHMENTS_REQUIRED, PRIORITY_GOALS_REQUIRED } from "@/lib/constants";
import { calculateWeeklyStreak, isWeeklyReviewDue } from "@/lib/utils";

export async function getUserOnboardingState(userId: string) {
  const [accomplishmentCount, priorityGoalCount, preferences] = await Promise.all([
    prisma.accomplishment.count({ where: { userId } }),
    prisma.priorityGoal.count({ where: { userId } }),
    prisma.userPreferences.findUnique({ where: { userId } }),
  ]);

  const accomplishmentsComplete = accomplishmentCount >= ACCOMPLISHMENTS_REQUIRED;
  const priorityGoalsComplete = priorityGoalCount >= PRIORITY_GOALS_REQUIRED;

  return {
    accomplishmentCount,
    priorityGoalCount,
    accomplishmentsComplete,
    priorityGoalsComplete,
    brainDumpSkipped: preferences?.brainDumpSkipped ?? false,
    canAccessBrainDump: accomplishmentsComplete,
    canAccessDashboard: priorityGoalsComplete,
    steps: [
      {
        id: "accomplishments",
        label: "Accomplishments Vault",
        complete: accomplishmentsComplete,
        href: "/vault",
      },
      {
        id: "brain-dump",
        label: "Goal Brain Dump",
        complete: false,
        href: "/brain-dump",
        optional: true,
      },
      {
        id: "priority-goals",
        label: "Priority Goal Builder",
        complete: priorityGoalsComplete,
        href: "/priority-goals",
      },
      {
        id: "dashboard",
        label: "Dashboard",
        complete: priorityGoalsComplete,
        href: "/dashboard",
      },
    ],
  };
}

export async function getGoalSettingSessionState(userId: string) {
  const preferences = await prisma.userPreferences.findUnique({ where: { userId } });
  const sessionActive = !!preferences?.goalSettingSessionStartedAt;

  return {
    sessionActive,
    vaultReviewedInSession: preferences?.accomplishmentsVaultReviewedInSession ?? false,
    sessionStartedAt: preferences?.goalSettingSessionStartedAt ?? null,
  };
}

export async function startGoalSettingSession(userId: string) {
  await prisma.userPreferences.upsert({
    where: { userId },
    create: {
      userId,
      goalSettingSessionStartedAt: new Date(),
      accomplishmentsVaultReviewedInSession: false,
    },
    update: {
      goalSettingSessionStartedAt: new Date(),
      accomplishmentsVaultReviewedInSession: false,
    },
  });
}

export async function markVaultReviewedInSession(userId: string) {
  await prisma.userPreferences.upsert({
    where: { userId },
    create: {
      userId,
      accomplishmentsVaultReviewedInSession: true,
      goalSettingSessionStartedAt: null,
    },
    update: {
      accomplishmentsVaultReviewedInSession: true,
      goalSettingSessionStartedAt: null,
    },
  });
}

export async function endGoalSettingSession(userId: string) {
  await prisma.userPreferences.upsert({
    where: { userId },
    create: { userId, goalSettingSessionStartedAt: null, accomplishmentsVaultReviewedInSession: false },
    update: { goalSettingSessionStartedAt: null, accomplishmentsVaultReviewedInSession: false },
  });
}

export async function getWeeklyReviewMeta(userId: string, accountCreatedAt: Date) {
  const reviews = await prisma.weeklyReview.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
    select: { completedAt: true },
  });

  const dates = reviews.map((r) => r.completedAt);
  const lastReview = dates[0] ?? null;
  const streak = calculateWeeklyStreak(dates);
  const due = isWeeklyReviewDue(lastReview, accountCreatedAt);

  return { streak, due, lastReview, reviewCount: reviews.length };
}

export async function ensureUserPreferences(userId: string) {
  return prisma.userPreferences.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}
