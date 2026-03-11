import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toDateStr } from "../../lib/dates";
import { buildCompletionMap } from "../../lib/stats";
import DonutChart from "../../components/charts/DonutChart";
import TaskList from "../../components/tasks/TaskList";
import MoodEntry from "../../components/mood/MoodEntry";
import { format } from "date-fns";
import { CheckSquare, Square } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

export default function TodayView() {
  const today = toDateStr(new Date());
  const now = new Date();

  const habits = useQuery(api.habits.getActive);
  const completions = useQuery(api.completions.getForDateRange, {
    startDate: today,
    endDate: today,
  });
  const tasks = useQuery(api.tasks.getForDate, { date: today }) as
    | Array<{ _id: Id<"tasks">; title: string; isRecurring: boolean; completed: boolean; completedForDate: boolean }>
    | undefined;

  const toggleHabit = useMutation(api.completions.toggle);

  const completionMap = buildCompletionMap(completions ?? []);
  const allHabits = habits ?? [];
  const allTasks = tasks ?? [];

  // Combined percent: (completed habits + completed tasks) / (total habits + total tasks)
  const completedHabits = allHabits.filter((h) => completionMap[today]?.[h._id]).length;
  const completedTasks = allTasks.filter((t) => t.completedForDate).length;
  const total = allHabits.length + allTasks.length;
  const completed = completedHabits + completedTasks;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const dateLabel = format(now, "EEEE, MMMM d");

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Date header */}
      <div style={{ textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
          {dateLabel}
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
          {completed} of {total} completed
        </p>
      </div>

      {/* Big progress ring */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <DonutChart percent={percent} size={200} thickness={18} />
      </div>

      {/* Habits */}
      <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.6 }}>
            Habits — {completedHabits}/{allHabits.length}
          </span>
        </div>
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {allHabits.map((habit) => {
            const done = completionMap[today]?.[habit._id] ?? false;
            return (
              <button
                key={habit._id}
                onClick={() => toggleHabit({ habitId: habit._id as Id<"habits">, date: today, completed: !done })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "10px 16px",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  textAlign: "left",
                  color: done ? "var(--text-muted)" : "var(--text-primary)",
                }}
              >
                <span style={{ color: done ? "var(--accent)" : "var(--border)", flexShrink: 0 }}>
                  {done ? <CheckSquare size={16} /> : <Square size={16} />}
                </span>
                <span style={{ fontSize: 13, textDecoration: done ? "line-through" : "none" }}>
                  {habit.name}
                </span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>
                  {habit.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks */}
      <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", padding: 16 }}>
        <TaskList date={today} />
      </div>

      {/* Mood */}
      <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", padding: 16 }}>
        <MoodEntry date={today} />
      </div>
    </div>
  );
}
