import { toDateStr } from "./dates";
import { subDays, parseISO } from "date-fns";

export type CompletionMap = Record<string, Record<string, boolean>>;

export const buildCompletionMap = (
  completions: Array<{ habitId: string; date: string; completed: boolean }>
): CompletionMap => {
  const map: CompletionMap = {};
  for (const c of completions) {
    if (!map[c.date]) map[c.date] = {};
    map[c.date][c.habitId] = c.completed;
  }
  return map;
};

export const getDayPercent = (
  date: string,
  habitIds: string[],
  map: CompletionMap
): number => {
  if (!habitIds.length) return 0;
  const dayMap = map[date] || {};
  const done = habitIds.filter((id) => dayMap[id]).length;
  return Math.round((done / habitIds.length) * 100);
};

export const getCategoryPercent = (
  date: string,
  categoryHabitIds: string[],
  map: CompletionMap
): number => getDayPercent(date, categoryHabitIds, map);

export const getCurrentStreak = (
  habitId: string,
  allCompletions: Array<{ habitId: string; date: string; completed: boolean }>
): number => {
  const completedDates = new Set(
    allCompletions
      .filter((c) => c.habitId === habitId && c.completed)
      .map((c) => c.date)
  );

  let streak = 0;
  const today = new Date();
  let check = toDateStr(today);

  if (!completedDates.has(check)) {
    check = toDateStr(subDays(today, 1));
  }

  while (completedDates.has(check)) {
    streak++;
    const d = parseISO(check);
    check = toDateStr(subDays(d, 1));
  }

  return streak;
};

export const getLongestStreak = (
  habitId: string,
  allCompletions: Array<{ habitId: string; date: string; completed: boolean }>
): number => {
  const dates = allCompletions
    .filter((c) => c.habitId === habitId && c.completed)
    .map((c) => c.date)
    .sort();

  if (!dates.length) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = parseISO(dates[i - 1]);
    const curr = parseISO(dates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
};
