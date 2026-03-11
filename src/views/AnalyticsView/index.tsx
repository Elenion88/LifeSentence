import { useMemo } from "react";
import { useQuery } from "convex/react";
import { useIsMobile } from "../../hooks/useIsMobile";
import { api } from "../../../convex/_generated/api";
import { subDays, format } from "date-fns";
import { toDateStr } from "../../lib/dates";
import { buildCompletionMap, getDayPercent, getCurrentStreak, getLongestStreak } from "../../lib/stats";
import { CATEGORIES, getCategoryColor } from "../../constants/categories";
import MoodChart from "../../components/charts/MoodChart";
import AreaTrendChart from "../../components/charts/AreaTrendChart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const cardStyle: React.CSSProperties = { background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", padding: 16 };
const sectionTitle: React.CSSProperties = { margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 };

export default function AnalyticsView() {
  const today = new Date();
  const isMobile = useIsMobile();
  const start30 = toDateStr(subDays(today, 30));
  const end = toDateStr(today);

  const habits = useQuery(api.habits.getActive);
  const completions = useQuery(api.completions.getForDateRange, { startDate: start30, endDate: end });
  const mood = useQuery(api.mood.getForDateRange, { startDate: start30, endDate: end });

  const completionMap = useMemo(() => buildCompletionMap(completions ?? []), [completions]);
  const allHabitIds = useMemo(() => (habits ?? []).map((h) => h._id as string), [habits]);

  const trendData = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => {
      const d = subDays(today, 29 - i);
      return { label: format(d, "MMM d"), percent: getDayPercent(toDateStr(d), allHabitIds, completionMap) };
    }),
    [completionMap, allHabitIds]
  );

  const categoryData = useMemo(() =>
    CATEGORIES.map((cat) => {
      const catHabits = (habits ?? []).filter((h) => h.category === cat.name);
      if (!catHabits.length) return null;
      const ids = catHabits.map((h) => h._id as string);
      const days = Array.from({ length: 30 }, (_, i) => toDateStr(subDays(today, i)));
      const avg = Math.round(days.reduce((sum, d) => sum + getDayPercent(d, ids, completionMap), 0) / days.length);
      return { name: cat.name, avg, color: cat.color };
    }).filter(Boolean) as { name: string; avg: number; color: string }[],
    [habits, completionMap]
  );

  const streakData = useMemo(() =>
    (habits ?? []).map((h) => ({
      name: h.name,
      category: h.category,
      current: getCurrentStreak(h._id, completions ?? []),
      longest: getLongestStreak(h._id, completions ?? []),
    })).sort((a, b) => b.current - a.current).slice(0, 10),
    [habits, completions]
  );

  const moodChartData = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => {
      const d = subDays(today, 29 - i);
      const ds = toDateStr(d);
      const entry = mood?.find((m) => m.date === ds);
      return { label: format(d, "MMM d"), mood: entry?.mood, motivation: entry?.motivation };
    }),
    [mood]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 style={{ margin: 0, fontSize: isMobile ? 18 : 20, fontWeight: 700 }}>Analytics — Last 30 Days</h2>

      <div style={cardStyle}>
        <p style={sectionTitle}>Overall Completion Trend</p>
        <AreaTrendChart data={trendData} height={140} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
        <div style={cardStyle}>
          <p style={sectionTitle}>Avg % by Category</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#8fa99a" }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#e8ede9" }} tickLine={false} axisLine={false} width={90} />
              <Tooltip contentStyle={{ background: "#242b29", border: "1px solid #3a4440", fontSize: 12 }} formatter={(v: number) => [`${v}%`]} />
              <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                {categoryData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={cardStyle}>
          <p style={sectionTitle}>Top Streaks</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {streakData.map((h) => (
              <div key={h.name} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: isMobile ? 36 : "auto" }}>
                <span style={{ flex: 1, fontSize: 13, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: 50, textAlign: "right" }}>best: {h.longest}d</span>
                <span style={{ fontSize: 13, fontWeight: 700, minWidth: 50, textAlign: "right", color: h.current > 0 ? getCategoryColor(h.category) : "var(--text-muted)" }}>
                  {h.current > 0 ? `🔥 ${h.current}d` : "—"}
                </span>
              </div>
            ))}
            {streakData.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>Start tracking to see streaks!</p>}
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: isMobile ? 8 : 0 }}>
        <p style={sectionTitle}>Mood & Motivation Trends</p>
        <MoodChart data={moodChartData} height={160} />
      </div>
    </div>
  );
}
