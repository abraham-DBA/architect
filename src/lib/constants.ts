export const LIFE_CATEGORIES = [
  "FINANCIAL",
  "HEALTH",
  "FAMILY",
  "SKILLS",
  "TRAVEL",
  "SPIRITUAL",
] as const;

export const TIME_HORIZONS = [
  "ONE_YEAR",
  "THREE_YEAR",
  "FIVE_YEAR",
  "TEN_YEAR",
] as const;

export const JOURNAL_TAGS = [
  "INSIGHT",
  "BREAKTHROUGH",
  "LESSON",
  "GENERAL",
] as const;

export const BOOK_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
] as const;

export const GOAL_STATUSES = [
  "IN_PROGRESS",
  "COMPLETED",
  "NEEDS_REEVALUATION",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  FINANCIAL: "Financial",
  HEALTH: "Health",
  FAMILY: "Family",
  SKILLS: "Skills",
  TRAVEL: "Travel",
  SPIRITUAL: "Spiritual",
};

export const HORIZON_LABELS: Record<string, string> = {
  ONE_YEAR: "1 Year",
  THREE_YEAR: "3 Year",
  FIVE_YEAR: "5 Year",
  TEN_YEAR: "10 Year",
};

export const JOURNAL_TAG_LABELS: Record<string, string> = {
  INSIGHT: "Insight",
  BREAKTHROUGH: "Breakthrough",
  LESSON: "Lesson",
  GENERAL: "General",
};

export const BOOK_STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export const GOAL_STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  NEEDS_REEVALUATION: "Needs Re-evaluation",
};

export const WEEKLY_REVIEW_QUESTIONS = [
  "What progress did I make toward my goals?",
  "What do I need to adjust in my approach?",
  "Who do I need to become more of?",
] as const;

export const MIN_TEXT_LENGTH = 10;
export const ACCOMPLISHMENTS_REQUIRED = 3;
export const PRIORITY_GOALS_REQUIRED = 4;
export const ACCOMPLISHMENTS_PER_PAGE = 20;
export const MAX_ACTION_STEPS = 50;
