import { useState } from "react";
import { addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getWeekDates, formatWeekRange, toDateStr } from "../../lib/dates";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { buildCompletionMap, getDayPercent, getCategoryPercent } from "../../lib/stats";
import { CATEGORIES } from "../../constants/categories";
import DonutChart from "../../components/charts/DonutChart";
import TaskList from "../../components/tasks/TaskList";
import MoodEntry from "../../components/mood/MoodEntry";

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

export default function WeeklyView() {
  const [refDate, setRefDate] = useState(new Date());
  const weekDates = getWeekDates(refDate);
  const startDate = toDateStr(weekDates[0]);
  const endDate = toDateStr(weekDates[6]);
  const today = toDateStr(new Date());

  const habits = useQuery(api.habits.getActive);
  const completions = useQuery(api.completions.getForDateRange, { startDate, endDate });

  const completionMap = buildCompletionMap(completions ?? []);
  const habitsByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    habits: (habits ?? []).filter((h) => h.category === cat.name),
  })).filter((c) => c.habits.length > 0);
  const allHabitIds = (habits ?? []).map((h) => h._id as string);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button onClick={() => setRefDate(subWeeks(refDate, 1))} style={navBtnStyle}><ChevronLeft size={18} /></button>
        <h2 style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: 600, margin: 0 }}>
          {formatWeekRange(weekDates)}
        </h2>
        <button onClick={() => setRefDate(addWeeks(refDate, 1))} style={navBtnStyle}><ChevronRight size={18} /></button>
        <button
          onClick={() => setRefDate(new Date())}
          style={{ ...navBtnStyle, fontSize: 12, padding: "6px 12px", width: "auto" }}
        >
          Today
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
        {weekDates.map((date) => {
          const ds = toDateStr(date);
          const isToday = ds === today;
          const overallPct = getDayPercent(ds, allHabitIds, completionMap);

          return (
            <div
              key={ds}
              style={{
                background: "var(--surface)",
                border: `1px solid ${isToday ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 12,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: isToday ? "var(--accent)" : "var(--text-primary)", marginTop: 2 }}>
                  {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <DonutChart percent={overallPct} size={80} thickness={10} />
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                {habitsByCategory.map((cat) => {
                  const pct = getCategoryPercent(ds, cat.habits.map((h) => h._id) as string[], completionMap);
                  return (
                    <DonutChart key={cat.name} percent={pct} size={44} thickness={6} color={cat.color} label={cat.name.slice(0, 4)} />
                  );
                })}
              </div>

              <TaskList date={ds} />
              {ds <= today && <MoodEntry date={ds} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
