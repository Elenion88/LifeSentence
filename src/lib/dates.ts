import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";

export const toDateStr = (date: Date): string => format(date, "yyyy-MM-dd");

export const todayStr = (): string => toDateStr(new Date());

export const getWeekDates = (referenceDate: Date): Date[] => {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const end = endOfWeek(referenceDate, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const getMonthDates = (year: number, month: number): Date[] => {
  const start = startOfMonth(new Date(year, month, 1));
  const end = endOfMonth(start);
  return eachDayOfInterval({ start, end });
};

export const formatWeekRange = (dates: Date[]): string =>
  `${format(dates[0], "MMM d")} – ${format(dates[6], "MMM d, yyyy")}`;
