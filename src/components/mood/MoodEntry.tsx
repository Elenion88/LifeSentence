import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";

export default function MoodEntry({ date }: { date: string }) {
  const existing = useQuery(api.mood.getForDateRange, { startDate: date, endDate: date });
  const upsert = useMutation(api.mood.upsert);
  const [mood, setMood] = useState(5);
  const [motivation, setMotivation] = useState(5);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (existing?.[0] && !dirty) {
      setMood(existing[0].mood);
      setMotivation(existing[0].motivation);
    }
  }, [existing, dirty]);

  const save = (newMood: number, newMotivation: number) => {
    setDirty(true);
    upsert({ date, mood: newMood, motivation: newMotivation });
  };

  return (
    <div>
      <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 6px" }}>Daily Check-in</p>
      {[
        { label: "Mood", value: mood, set: setMood, color: "#7ab087" },
        { label: "Motivation", value: motivation, set: setMotivation, color: "#9e7ac4" },
      ].map(({ label, value, set, color }) => (
        <div key={label} style={{ marginBottom: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
            <span style={{ fontSize: 11, color, fontWeight: 600 }}>{value}/10</span>
          </div>
          <input
            type="range" min={1} max={10} value={value}
            onChange={(e) => {
              const v = Number(e.target.value);
              set(v);
              save(label === "Mood" ? v : mood, label === "Motivation" ? v : motivation);
            }}
            style={{ width: "100%", accentColor: color, cursor: "pointer" }}
          />
        </div>
      ))}
    </div>
  );
}
