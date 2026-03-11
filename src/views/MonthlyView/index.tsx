import { useState, useMemo } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getMonthDates, toDateStr } from "../../lib/dates";
import { buildCompletionMap, getDayPercent, getCurrentStreak } from "../../lib/stats";
import { CATEGORIES } from "../../constants/categories";
import AreaTrendChart from "../../components/charts/AreaTrendChart";
import MoodChart from "../../components/charts/MoodChart";
import { Id } from "../../../convex/_generated/dataModel";

const navBtnStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  width: 36,
  height: 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "var(--text-primary)",
};

export default function MonthlyView() {
  const [refDate, setRefDate] = useState(new Date());
  const yearMonth = format(refDate, "yyyy-MM");
  const monthDates = getMonthDates(refDate.getFullYear(), refDate.getMonth());
  const today = toDateStr(new Date());

  const habits = useQuery(api.habits.getActive);
  const completions = useQuery(api.completions.getForMonth, { yearMonth });
  const moodData = useQuery(api.mood.getForDateRange, {
    startDate: toDateStr(monthDates[0]),
    endDate: toDateStr(monthDates[monthDates.length - 1]),
  });

  const completionMap = useMemo(() => buildCompletionMap(completions ?? []), [completions]);
  const toggle = useMutation(api.completions.toggle);

  const habitsByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    habits: (habits ?? []).filter((h) => h.category === cat.name),
  })).filter((c) => c.habits.length > 0);

  const allHabitIds = (habits ?? []).map((h) => h._id as string);
  const completedTotal = completions?.filter((c) => c.completed).length ?? 0;
  const eligibleDays = monthDates.filter((d) => toDateStr(d) <= today).length;
  const totalPossible = allHabitIds.length * eligibleDays;
  const progressPct = totalPossible > 0 ? Math.round((completedTotal / totalPossible) * 100) : 0;

  const trendData = monthDates.map((d) => ({
    label: format(d, "d"),
    percent: getDayPercent(toDateStr(d), allHabitIds, completionMap),
  }));

  const moodChartData = monthDates.map((d) => {
    const ds = toDateStr(d);
    const entry = moodData?.find((m) => m.date === ds);
    return { label: format(d, "d"), mood: entry?.mood, motivation: entry?.motivation };
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <button onClick={() => setRefDate(subMonths(refDate, 1))} style={navBtnStyle}><ChevronLeft size={18} /></button>
        <h2 style={{ flex: 1, textAlign: "center", fontSize: 20, fontWeight: 700, margin: 0 }}>{format(refDate, "MMMM yyyy")}</h2>
        <button onClick={() => setRefDate(addMonths(refDate, 1))} style={navBtnStyle}><ChevronRight size={18} /></button>
      </div>

      <div style={{ display: "flex", gap: 20, marginBottom: 20, padding: "12px 16px", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }}>
        {[
          { label: "Total Habits", value: allHabitIds.length },
          { label: "Completions", value: completedTotal },
          { label: "Progress", value: `${progressPct}%` },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", overflow: "auto", marginBottom: 16 }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ width: 180, padding: "8px 12px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--border)", position: "sticky", left: 0, background: "var(--surface)" }}>Habit</th>
              {monthDates.map((d) => {
                const ds = toDateStr(d);
                return (
                  <th key={ds} style={{ width: 22, minWidth: 22, padding: "4px 1px", textAlign: "center", color: ds === today ? "var(--accent)" : "var(--text-muted)", fontWeight: ds === today ? 700 : 400, borderBottom: "1px solid var(--border)", fontSize: 10 }}>
                    {format(d, "d")}
                  </th>
                );
              })}
              <th style={{ width: 70, padding: "8px 8px", textAlign: "center", color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>Streak</th>
              <th style={{ width: 44, padding: "8px 8px", textAlign: "center", color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>%</th>
            </tr>
          </thead>
          <tbody>
            {habitsByCategory.map((cat) => (
              <>
                <tr key={`cat-${cat.name}`}>
                  <td colSpan={monthDates.length + 3} style={{ padding: "6px 12px", fontSize: 11, fontWeight: 700, color: cat.color, background: cat.bg, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    {cat.name}
                  </td>
                </tr>
                {cat.habits.map((habit) => {
                  const completedDays = monthDates.filter((d) => completionMap[toDateStr(d)]?.[habit._id]).length;
                  const habEligible = monthDates.filter((d) => toDateStr(d) <= today).length;
                  const pct = habEligible > 0 ? Math.round((completedDays / habEligible) * 100) : 0;
                  const streak = getCurrentStreak(habit._id, completions ?? []);
                  return (
                    <tr key={habit._id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "4px 12px", color: "var(--text-primary)", position: "sticky", left: 0, background: "var(--surface)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {habit.name}
                      </td>
                      {monthDates.map((d) => {
                        const ds = toDateStr(d);
                        const done = completionMap[ds]?.[habit._id] ?? false;
                        const isFuture = ds > today;
                        return (
                          <td key={ds} style={{ textAlign: "center", padding: "2px 1px" }}>
                            <button
                              onClick={() => !isFuture && toggle({ habitId: habit._id as Id<"habits">, date: ds, completed: !done })}
                              style={{
                                width: 18, height: 18, borderRadius: 3,
                                border: `1px solid ${done ? cat.color : "var(--border)"}`,
                                background: done ? cat.color : "transparent",
                                cursor: isFuture ? "default" : "pointer",
                                opacity: isFuture ? 0.3 : 1,
                                display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
                              }}
                            >
                              {done && <span style={{ color: "white", fontSize: 10, lineHeight: 1 }}>✓</span>}
                            </button>
                          </td>
                        );
                      })}
                      <td style={{ textAlign: "center", color: streak > 0 ? "var(--accent-light)" : "var(--text-muted)", fontWeight: streak > 0 ? 700 : 400, fontSize: 11 }}>
                        {streak > 0 ? `🔥 ${streak}d` : "—"}
                      </td>
                      <td style={{ textAlign: "center", color: pct >= 70 ? "var(--accent)" : "var(--text-muted)", fontWeight: 600, fontSize: 11 }}>{pct}%</td>
                    </tr>
                  );
                })}
              </>
            ))}
            <tr style={{ borderTop: "2px solid var(--border)" }}>
              <td style={{ padding: "6px 12px", color: "var(--text-muted)", fontWeight: 600, position: "sticky", left: 0, background: "var(--surface)", fontSize: 11 }}>Daily %</td>
              {monthDates.map((d) => {
                const ds = toDateStr(d);
                const pct = getDayPercent(ds, allHabitIds, completionMap);
                const isFuture = ds > today;
                return (
                  <td key={ds} style={{ textAlign: "center", padding: "4px 1px" }}>
                    {!isFuture && <div style={{ fontSize: 9, color: pct >= 70 ? "var(--accent)" : "var(--text-muted)", fontWeight: 600 }}>{pct}</div>}
                  </td>
                );
              })}
              <td colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", padding: 16, marginBottom: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 8px" }}>Completion Trend</p>
        <AreaTrendChart data={trendData} />
      </div>

      <div style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", padding: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 8px" }}>Mood & Motivation</p>
        <MoodChart data={moodChartData} />
      </div>
    </div>
  );
}
