import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, startOfDay, differenceInCalendarDays, addMonths } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stripWhitespaceLength(value: string): number {
  return value.replace(/\s/g, "").length;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy-MM-dd");
}

export function isOverdue(deadline: Date | string | null | undefined, done: boolean): boolean {
  if (!deadline || done) return false;
  const d = typeof deadline === "string" ? new Date(deadline) : deadline;
  return startOfDay(d) < startOfDay(new Date());
}

export function isActionableToday(deadline: Date | string | null | undefined, done: boolean): boolean {
  if (!deadline || done) return false;
  const d = typeof deadline === "string" ? new Date(deadline) : deadline;
  return startOfDay(d) <= startOfDay(new Date());
}

export function decimalToNumber(value: { toNumber?: () => number } | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "object" && "toNumber" in value && value.toNumber) {
    return value.toNumber();
  }
  return Number(value);
}

export function calculateSavingsProgress(totalSaved: number, target: number) {
  if (target <= 0) {
    return { percentage: 0, remaining: 0, cappedPercentage: 0 };
  }
  const percentage = (totalSaved / target) * 100;
  const cappedPercentage = Math.min(percentage, 100);
  const remaining = Math.max(target - totalSaved, 0);
  return { percentage, cappedPercentage, remaining };
}

export function calculateProjectedCompletionDate(
  contributions: { date: Date | string; amount: number }[],
  target: number,
  totalSaved: number
): Date | null {
  if (contributions.length === 0 || totalSaved >= target) return null;

  const sorted = [...contributions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const firstDate = new Date(sorted[0]!.date);
  const lastDate = new Date(sorted[sorted.length - 1]!.date);
  const monthsSpan = Math.max(
    1,
    (lastDate.getFullYear() - firstDate.getFullYear()) * 12 +
      (lastDate.getMonth() - firstDate.getMonth()) +
      1
  );
  const totalContributed = sorted.reduce((sum, c) => sum + c.amount, 0);
  const monthlyRate = totalContributed / monthsSpan;

  if (monthlyRate <= 0) return null;

  const remaining = target - totalSaved;
  const monthsNeeded = Math.ceil(remaining / monthlyRate);
  return addMonths(new Date(), monthsNeeded);
}

export function calculateWeeklyStreak(reviewDates: Date[]): number {
  if (reviewDates.length === 0) return 0;

  const sorted = [...reviewDates].sort((a, b) => b.getTime() - a.getTime());
  const mostRecent = sorted[0]!;
  const daysSinceLast = differenceInCalendarDays(new Date(), mostRecent);

  if (daysSinceLast > 7) return 0;

  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]!;
    const next = sorted[i + 1]!;
    const gap = differenceInCalendarDays(current, next);
    if (gap <= 7) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

export function isWeeklyReviewDue(lastReviewDate: Date | null, accountCreatedAt: Date): boolean {
  if (!lastReviewDate) {
    return differenceInCalendarDays(new Date(), accountCreatedAt) >= 7;
  }
  return differenceInCalendarDays(new Date(), lastReviewDate) >= 7;
}

export function todayDateKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}
