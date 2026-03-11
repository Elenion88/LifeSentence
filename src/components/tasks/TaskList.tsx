import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { CheckSquare, Square, Plus, Trash2, RefreshCw } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

type TaskWithCompletion = {
  _id: Id<"tasks">;
  title: string;
  isRecurring: boolean;
  completed: boolean;
  completedForDate: boolean;
};

export default function TaskList({ date }: { date: string }) {
  const tasks = useQuery(api.tasks.getForDate, { date }) as TaskWithCompletion[] | undefined;
  const createTask = useMutation(api.tasks.create);
  const toggleOneTime = useMutation(api.tasks.toggleOneTime);
  const toggleRecurring = useMutation(api.tasks.toggleRecurring);
  const removeTask = useMutation(api.tasks.remove);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await createTask({ title: newTitle.trim(), date, isRecurring: false });
    setNewTitle("");
    setAdding(false);
  };

  const handleToggle = (task: TaskWithCompletion) => {
    if (task.isRecurring) {
      toggleRecurring({ taskId: task._id, date, completed: !task.completedForDate });
    } else {
      toggleOneTime({ id: task._id, completed: !task.completedForDate });
    }
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 8px" }}>Tasks</p>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {(tasks ?? []).map((task) => (
          <div key={task._id} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, borderBottom: "1px solid var(--border)" }}>
            <button
              onClick={() => handleToggle(task)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "0 4px", color: task.completedForDate ? "var(--accent)" : "var(--border)", flexShrink: 0, minWidth: 32, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", touchAction: "manipulation" }}
            >
              {task.completedForDate ? <CheckSquare size={20} /> : <Square size={20} />}
            </button>
            <span style={{
              fontSize: 14, flex: 1,
              color: task.completedForDate ? "var(--text-muted)" : "var(--text-primary)",
              textDecoration: task.completedForDate ? "line-through" : "none",
            }}>
              {task.title}
            </span>
            {task.isRecurring && <RefreshCw size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
            {!task.isRecurring && (
              <button
                onClick={() => removeTask({ id: task._id })}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "0 4px", color: "var(--text-muted)", minWidth: 32, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", touchAction: "manipulation" }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
      {adding ? (
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
            placeholder="Task name..."
            style={{
              flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "var(--text-primary)", outline: "none",
            }}
          />
          <button onClick={handleAdd} style={{ background: "var(--accent)", border: "none", borderRadius: 8, padding: "10px 14px", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", touchAction: "manipulation" }}>Add</button>
          <button onClick={() => setAdding(false)} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text-muted)", fontSize: 14, cursor: "pointer", touchAction: "manipulation" }}>✕</button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 14, marginTop: 6, padding: "6px 0", minHeight: 40, touchAction: "manipulation" }}
        >
          <Plus size={16} /> Add task
        </button>
      )}
    </div>
  );
}
