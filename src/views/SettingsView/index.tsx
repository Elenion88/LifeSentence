import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Plus, Trash2, ToggleLeft, ToggleRight, RefreshCw } from "lucide-react";
import { CATEGORIES } from "../../constants/categories";
import { Id } from "../../../convex/_generated/dataModel";

const inputStyle: React.CSSProperties = {
  flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--text-primary)", outline: "none",
};
const addBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, background: "var(--accent)", border: "none",
  borderRadius: 8, padding: "8px 16px", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
};

export default function SettingsView() {
  const [tab, setTab] = useState<"habits" | "recurring">("habits");
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitCategory, setNewHabitCategory] = useState("Mental");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const habits = useQuery(api.habits.getAll);
  const recurringTasks = useQuery(api.tasks.getRecurring);
  const updateHabit = useMutation(api.habits.update);
  const removeHabit = useMutation(api.habits.remove);
  const createHabit = useMutation(api.habits.create);
  const createTask = useMutation(api.tasks.create);
  const removeTask = useMutation(api.tasks.remove);

  const today = new Date().toISOString().slice(0, 10);

  const habitsByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    habits: (habits ?? []).filter((h) => h.category === cat.name),
  }));

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700 }}>Settings</h2>

      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {(["habits", "recurring"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: tab === t ? "var(--accent)" : "var(--surface)", color: tab === t ? "white" : "var(--text-muted)", cursor: "pointer", fontSize: 13, fontWeight: tab === t ? 600 : 400, textTransform: "capitalize" }}>
            {t === "recurring" ? "Recurring Tasks" : "Habits"}
          </button>
        ))}
      </div>

      {tab === "habits" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, padding: 16, background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }}>
            <input value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} placeholder="New habit name..." style={inputStyle} onKeyDown={(e) => e.key === "Enter" && document.getElementById("add-habit-btn")?.click()} />
            <select value={newHabitCategory} onChange={(e) => setNewHabitCategory(e.target.value)} style={{ ...inputStyle, flex: "none", width: 150 }}>
              {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <button id="add-habit-btn" style={addBtnStyle} onClick={async () => {
              if (!newHabitName.trim()) return;
              const catHabits = (habits ?? []).filter((h) => h.category === newHabitCategory);
              await createHabit({ name: newHabitName.trim(), category: newHabitCategory, order: catHabits.length + 1 });
              setNewHabitName("");
            }}>
              <Plus size={16} /> Add Habit
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {habitsByCategory.map((cat) => (
              <div key={cat.name} style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden" }}>
                <div style={{ padding: "8px 16px", background: cat.bg, fontSize: 12, fontWeight: 700, color: cat.color, textTransform: "uppercase", letterSpacing: 0.8 }}>{cat.name}</div>
                {cat.habits.length === 0 && <div style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: 12 }}>No habits in this category</div>}
                {cat.habits.map((habit) => (
                  <div key={habit._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ flex: 1, fontSize: 13, color: habit.isActive ? "var(--text-primary)" : "var(--text-muted)", textDecoration: habit.isActive ? "none" : "line-through" }}>{habit.name}</span>
                    <button onClick={() => updateHabit({ id: habit._id as Id<"habits">, isActive: !habit.isActive })} style={{ background: "none", border: "none", cursor: "pointer", color: habit.isActive ? "var(--accent)" : "var(--text-muted)", padding: 0 }} title={habit.isActive ? "Deactivate" : "Activate"}>
                      {habit.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    <button onClick={() => removeHabit({ id: habit._id as Id<"habits"> })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--border)", padding: 0 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "recurring" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, padding: 16, background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }}>
            <input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Recurring task name..." style={inputStyle} onKeyDown={(e) => { if (e.key === "Enter") { if (!newTaskTitle.trim()) return; createTask({ title: newTaskTitle.trim(), date: today, isRecurring: true }); setNewTaskTitle(""); } }} />
            <button style={addBtnStyle} onClick={async () => {
              if (!newTaskTitle.trim()) return;
              await createTask({ title: newTaskTitle.trim(), date: today, isRecurring: true });
              setNewTaskTitle("");
            }}>
              <Plus size={16} /> Add Recurring
            </button>
          </div>

          <div style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "8px 16px", background: "var(--surface-2)", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
              <RefreshCw size={12} /> Recurring Daily Tasks
            </div>
            {(recurringTasks ?? []).length === 0 && <div style={{ padding: "20px 16px", color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>No recurring tasks yet</div>}
            {(recurringTasks ?? []).map((task) => (
              <div key={task._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ flex: 1, fontSize: 13, color: "var(--text-primary)" }}>{task.title}</span>
                <button onClick={() => removeTask({ id: task._id as Id<"tasks"> })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--border)", padding: 0 }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
