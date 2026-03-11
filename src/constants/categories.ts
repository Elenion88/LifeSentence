export const CATEGORIES = [
  { name: "Mental", color: "#7ab087", bg: "#7ab08722" },
  { name: "Physical", color: "#5a9ec4", bg: "#5a9ec422" },
  { name: "Nutrition", color: "#c4a25a", bg: "#c4a25a22" },
  { name: "Productivity", color: "#9e7ac4", bg: "#9e7ac422" },
  { name: "Focus", color: "#c47a5a", bg: "#c47a5a22" },
  { name: "Relationships", color: "#c45a7a", bg: "#c45a7a22" },
  { name: "Organization", color: "#5ac4b0", bg: "#5ac4b022" },
] as const;

export type CategoryName = typeof CATEGORIES[number]["name"];

export const getCategoryColor = (category: string): string =>
  CATEGORIES.find((c) => c.name === category)?.color ?? "#8fa99a";

export const getCategoryBg = (category: string): string =>
  CATEGORIES.find((c) => c.name === category)?.bg ?? "#8fa99a22";
