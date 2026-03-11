import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useIsMobile } from "../../hooks/useIsMobile";

const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function RatingRow({
  label,
  value,
  color,
  onChange,
  isMobile,
}: {
  label: string;
  value: number;
  color: string;
  onChange: (v: number) => void;
  isMobile: boolean;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 14, color, fontWeight: 700 }}>{value}/10</span>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(5, 1fr)" : "repeat(10, 1fr)",
        gap: 4,
      }}>
        {RATINGS.map((n) => {
          const active = n <= value;
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              style={{
                height: isMobile ? 40 : 34,
                borderRadius: 6,
                border: `1px solid ${active ? color : "var(--border)"}`,
                background: active ? color : "var(--surface-2)",
                color: active ? "white" : "var(--text-muted)",
                fontSize: 13,
                fontWeight: active ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.1s",
                opacity: active ? 1 : 0.6,
                touchAction: "manipulation",
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MoodEntry({ date }: { date: string }) {
  const existing = useQuery(api.mood.getForDateRange, { startDate: date, endDate: date });
  const upsert = useMutation(api.mood.upsert);
  const [mood, setMood] = useState(5);
  const [motivation, setMotivation] = useState(5);
  const [dirty, setDirty] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (existing?.[0] && !dirty) {
      setMood(existing[0].mood);
      setMotivation(existing[0].motivation);
    }
  }, [existing, dirty]);

  const handleChange = (newMood: number, newMotivation: number) => {
    setDirty(true);
    upsert({ date, mood: newMood, motivation: newMotivation });
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, margin: "0 0 16px" }}>
        Daily Check-in
      </p>
      <RatingRow
        label="Mood"
        value={mood}
        color="#7ab087"
        onChange={(v) => { setMood(v); handleChange(v, motivation); }}
        isMobile={isMobile}
      />
      <RatingRow
        label="Motivation"
        value={motivation}
        color="#9e7ac4"
        onChange={(v) => { setMotivation(v); handleChange(mood, v); }}
        isMobile={isMobile}
      />
    </div>
  );
}
