import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getGoalSettingSessionState, getUserOnboardingState, getWeeklyReviewMeta } from "@/lib/user-state";
import { getQuoteOfTheDay } from "@/lib/quotes";
import { Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { QuoteCard } from "@/components/quote-card";
import {
  CATEGORY_LABELS,
  GOAL_STATUS_LABELS,
  HORIZON_LABELS,
} from "@/lib/constants";
import {
  calculateSavingsProgress,
  decimalToNumber,
  formatCurrency,
  isActionableToday,
  isOverdue,
} from "@/lib/utils";
import { format } from "date-fns";

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const onboarding = await getUserOnboardingState(user.id);
  if (!onboarding.canAccessDashboard) {
    redirect("/vault");
  }

  const [goals, reviewMeta, session, quoteData] = await Promise.all([
    prisma.priorityGoal.findMany({
      where: { userId: user.id },
      include: {
        actionSteps: { orderBy: { sortOrder: "asc" } },
        savingsContributions: true,
      },
      orderBy: { rank: "asc" },
    }),
    getWeeklyReviewMeta(user.id, user.createdAt),
    getGoalSettingSessionState(user.id),
    getQuoteOfTheDay(user.id),
  ]);

  const actionItems = goals
    .flatMap((goal) =>
      goal.actionSteps
        .filter((step) => isActionableToday(step.deadline, step.done))
        .map((step) => ({
          goalId: goal.id,
          goalStatement: goal.statement,
          stepId: step.id,
          description: step.description,
          deadline: step.deadline!,
          overdue: isOverdue(step.deadline, step.done),
        }))
    )
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return (
    <div className="space-y-6">
      {reviewMeta.due && (
        <Alert variant="warning">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>Your weekly review is due. Take 10 minutes to reflect and adjust.</span>
            <Link href="/weekly-review" className="shrink-0">
              <Button className="w-full sm:w-auto">Start Weekly Review</Button>
            </Link>
          </div>
        </Alert>
      )}

      {session.sessionActive && !session.vaultReviewedInSession && (
        <Alert variant="info">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>Review your Accomplishments Vault to close this goal-setting session.</span>
            <Link href="/vault" className="shrink-0">
              <Button variant="secondary" className="w-full sm:w-auto">Review Vault</Button>
            </Link>
          </div>
        </Alert>
      )}

      <PageHeader
        title="Dashboard"
        description="Your daily command center for becoming and achieving."
        actions={
          <div className="rounded-xl bg-accent-surface px-5 py-3 text-center">
            <div className="text-2xl font-bold text-accent-foreground">{reviewMeta.streak}</div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted">Week streak</div>
          </div>
        }
      />

      <OnboardingProgress steps={onboarding.steps} />

      <QuoteCard
        quoteId={quoteData.quote.id}
        text={quoteData.quote.text}
        initialFavorite={quoteData.isFavorite}
      />

      <section className="grid gap-4 sm:grid-cols-2">
        {goals.length === 0 ? (
          <div className="sm:col-span-2">
            <EmptyState
              icon={Target}
              title="No priority goals yet"
              description="Select exactly 4 goals from your brain dump to unlock your full dashboard."
              action={
                <Link href="/priority-goals">
                  <Button>Build Priority Goals</Button>
                </Link>
              }
            />
          </div>
        ) : goals.map((goal) => {
          const doneSteps = goal.actionSteps.filter((s) => s.done).length;
          const totalSteps = goal.actionSteps.length;
          const completion = totalSteps === 0 ? 0 : totalSteps > 0 && doneSteps === totalSteps ? 100 : Math.round((doneSteps / totalSteps) * 100);
          const target = decimalToNumber(goal.financialTarget);
          const saved = goal.savingsContributions.reduce((sum, c) => sum + decimalToNumber(c.amount), 0);
          const savings = calculateSavingsProgress(saved, target);

          return (
            <Card key={goal.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <Link href={`/goals/${goal.id}`} className="text-base font-semibold break-words hover:text-primary sm:text-lg">
                    #{goal.rank} {goal.statement}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {CATEGORY_LABELS[goal.category]} · {HORIZON_LABELS[goal.timeHorizon]}
                  </p>
                </div>
                <Badge>{GOAL_STATUS_LABELS[goal.status]}</Badge>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-sm">
                  <span>Action plan</span>
                  <span>{totalSteps === 0 ? "Add steps" : `${completion}%`}</span>
                </div>
                <ProgressBar value={completion} />
              </div>
              {target > 0 && (
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Savings</span>
                    <span>{formatCurrency(saved)} / {formatCurrency(target)}</span>
                  </div>
                  <ProgressBar value={savings.cappedPercentage} />
                </div>
              )}
            </Card>
          );
        })}
      </section>

      <Card>
        <h2 className="text-lg font-semibold">Today&apos;s action items</h2>
        {actionItems.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">No actionable items due today. Stay disciplined.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {actionItems.map((item) => (
              <li
                key={item.stepId}
                className={`rounded-lg border px-4 py-3 ${item.overdue ? "border-red-300 bg-red-50" : "border-stone-200"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-sm text-stone-500">{item.goalStatement}</p>
                  </div>
                  <span className="text-sm text-stone-500">
                    {format(new Date(item.deadline), "MMM d, yyyy")}
                    {item.overdue ? " · Overdue" : ""}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
