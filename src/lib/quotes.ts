import { prisma } from "@/lib/db";
import { format, subDays } from "date-fns";
import { todayDateKey } from "@/lib/utils";

export async function getQuoteOfTheDay(userId: string) {
  const today = todayDateKey();
  const existingView = await prisma.userQuoteView.findUnique({
    where: { userId_viewedDate: { userId, viewedDate: today } },
    include: { quote: true },
  });

  if (existingView) {
    const favorite = await prisma.userQuoteFavorite.findUnique({
      where: { userId_quoteId: { userId, quoteId: existingView.quoteId } },
    });
    return { quote: existingView.quote, isFavorite: !!favorite };
  }

  const quotes = await prisma.quote.findMany({ orderBy: { id: "asc" } });
  if (quotes.length === 0) {
    return {
      quote: {
        id: "default",
        text: "Success is something you attract by the person you become. — Jim Rohn",
      },
      isFavorite: false,
    };
  }

  const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");
  const recentViews = await prisma.userQuoteView.findMany({
    where: { userId, viewedDate: { gte: thirtyDaysAgo } },
    select: { quoteId: true },
  });
  const recentQuoteIds = new Set(recentViews.map((v) => v.quoteId));

  let candidates = quotes.filter((q) => !recentQuoteIds.has(q.id));
  if (candidates.length === 0) {
    candidates = quotes;
  }

  const dayIndex = Math.floor(
    new Date(today).getTime() / (1000 * 60 * 60 * 24)
  );
  const quote = candidates[dayIndex % candidates.length]!;

  await prisma.userQuoteView.create({
    data: { userId, quoteId: quote.id, viewedDate: today },
  });

  const favorite = await prisma.userQuoteFavorite.findUnique({
    where: { userId_quoteId: { userId, quoteId: quote.id } },
  });

  return { quote, isFavorite: !!favorite };
}
