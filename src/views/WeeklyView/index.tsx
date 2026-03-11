import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toDateStr } from "../../lib/dates";
import { buildCompletionMap } from "../../lib/stats";
import DonutChart from "../../components/charts/DonutChart";
import TaskList from "../../components/tasks/TaskList";
import MoodEntry from "../../components/mood/MoodEntry";
import { format, subDays, addDays, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CheckSquare, Square } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { useIsMobile } from "../../hooks/useIsMobile";

const navBtn: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  width: 44,
  height: 44,
  minWidth: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "var(--text-primary)",
  flexShrink: 0,
};

export default function TodayView() {
  const todayStr = toDateStr(new Date());
  const [dateStr, setDateStr] = useState(todayStr);
  const isToday = dateStr === todayStr;
  const date = parseISO(dateStr);
  const isMobile = useIsMobile();

  const habits = useQuery(api.habits.getActive);
  const completions = useQuery(api.completions.getForDateRange, {
    startDate: dateStr,
    endDate: dateStr,
  });
  const tasks = useQuery(api.tasks.getForDate, { date: dateStr }) as
    | Array<{ _id: Id<"tasks">; title: string; isRecurring: boolean; completed: boolean; completedForDate: boolean }>
    | undefined;

  const toggleHabit = useMutation(api.completions.toggle);

  const completionMap = buildCompletionMap(completions ?? []);
  const allHabits = habits ?? [];
  const allTasks = tasks ?? [];

  const completedHabits = allHabits.filter((h) => completionMap[dateStr]?.[h._id]).length;
  const completedTasks = allTasks.filter((t) => t.completedForDate).length;
  const total = allHabits.length + allTasks.length;
  const completed = completedHabits + completedTasks;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const donutSize = isMobile ? 160 : 200;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: isMobile ? 16 : 24 }}>
      {/* Date nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button style={navBtn} onClick={() => setDateStr(toDateStr(subDays(date, 1)))}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? 18 : 20, fontWeight: 700, color: "var(--text-primary)" }}>
            {isToday ? "Today" : format(date, "EEEE")}
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: isToday ? "var(--accent)" : "var(--text-muted)" }}>
            {format(date, "MMMM d, yyyy")}
          </p>
        </div>
        <button
          style={{ ...navBtn, opacity: isToday ? 0.3 : 1, cursor: isToday ? "default" : "pointer" }}
          onClick={() => !isToday && setDateStr(toDateStr(addDays(date, 1)))}
          disabled={isToday}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Jump to today */}
      {!isToday && (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => setDateStr(todayStr)}
            style={{ background: "var(--surface)", border: "1px solid var(--accent)", borderRadius: 8, padding: "8px 20px", color: "var(--accent)", fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 44 }}
          >
            Back to Today
          </button>
        </div>
      )}

      {/* Progress ring */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <DonutChart percent={percent} size={donutSize} thickness={18} />
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
          {completed} of {total} completed
        </p>
      </div>

      {/* Habits */}
      <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.6 }}>
            Habits — {completedHabits}/{allHabits.length}
          </span>
        </div>
        <div>
          {allHabits.map((habit) => {
            const done = completionMap[dateStr]?.[habit._id] ?? false;
            return (
              <button
                key={habit._id}
                onClick={() => toggleHabit({ habitId: habit._id as Id<"habits">, date: dateStr, completed: !done })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  minHeight: 48,
                  padding: "10px 16px",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  textAlign: "left",
                  color: done ? "var(--text-muted)" : "var(--text-primary)",
                  touchAction: "manipulation",
                }}
              >
                <span style={{ color: done ? "var(--accent)" : "var(--border)", flexShrink: 0 }}>
                  {done ? <CheckSquare size={20} /> : <Square size={20} />}
                </span>
                <span style={{ fontSize: 14, textDecoration: done ? "line-through" : "none", flex: 1 }}>
                  {habit.name}
                </span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {habit.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks */}
      <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", padding: 16 }}>
        <TaskList date={dateStr} />
      </div>

      {/* Mood */}
      <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", padding: 16, marginBottom: isMobile ? 8 : 0 }}>
        <MoodEntry date={dateStr} />
      </div>
    </div>
  );
}
