import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getGoalSettingSessionState, getUserOnboardingState, getWeeklyReviewMeta } from "@/lib/user-state";
import { getQuoteOfTheDay } from "@/lib/quotes";
import { Target, ArrowRight, Clock, AlertTriangle } from "lucide-react";
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getStatusBadgeVariant(status: string): "default" | "success" | "warning" {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "NEEDS_REEVALUATION":
      return "warning";
    default:
      return "default";
  }
}

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

  const displayName = user.name || "Architect";

  return (
    <div className="space-y-6 sm:space-y-8">
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
        title={`${getGreeting()}, ${displayName}`}
        description="Your daily command center for becoming and achieving."
        actions={
          <div className="rounded-xl bg-accent-surface px-5 py-3 text-center shadow-sm">
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
        ) : goals.map((goal, index) => {
          const doneSteps = goal.actionSteps.filter((s) => s.done).length;
          const totalSteps = goal.actionSteps.length;
          const completion = totalSteps === 0 ? 0 : totalSteps > 0 && doneSteps === totalSteps ? 100 : Math.round((doneSteps / totalSteps) * 100);
          const target = decimalToNumber(goal.financialTarget);
          const saved = goal.savingsContributions.reduce((sum, c) => sum + decimalToNumber(c.amount), 0);
          const savings = calculateSavingsProgress(saved, target);

          return (
            <Card key={goal.id} interactive className="animate-fade-in-up" style={{ animationDelay: `${index * 75}ms` }}>
              <Link href={`/goals/${goal.id}`} className="block">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-surface text-xs font-bold text-accent-foreground">
                        {goal.rank}
                      </span>
                      <h3 className="text-base font-semibold break-words hover:text-primary transition-colors sm:text-lg">
                        {goal.statement}
                      </h3>
                    </div>
                    <p className="mt-1.5 text-sm text-muted">
                      {CATEGORY_LABELS[goal.category]} · {HORIZON_LABELS[goal.timeHorizon]}
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(goal.status)}>
                    {GOAL_STATUS_LABELS[goal.status]}
                  </Badge>
                </div>
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-muted">Action plan</span>
                    <span className="font-medium">{totalSteps === 0 ? "Add steps" : `${completion}%`}</span>
                  </div>
                  <ProgressBar value={completion} />
                </div>
                {target > 0 && (
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="text-muted">Savings</span>
                      <span className="font-medium">{formatCurrency(saved)} / {formatCurrency(target)}</span>
                    </div>
                    <ProgressBar value={savings.cappedPercentage} />
                  </div>
                )}
              </Link>
            </Card>
          );
        })}
      </section>

      <Card>
        <h2 className="text-lg font-semibold">Today&apos;s action items</h2>
        {actionItems.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No actionable items due today. Stay disciplined.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {actionItems.map((item) => (
              <li
                key={item.stepId}
                className={`flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                  item.overdue
                    ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
                    : "border-border"
                }`}
              >
                {item.overdue ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                ) : (
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.description}</p>
                  <p className="text-sm text-muted">{item.goalStatement}</p>
                </div>
                <span className="shrink-0 text-sm text-muted">
                  {format(new Date(item.deadline), "MMM d")}
                  {item.overdue ? " · Overdue" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
