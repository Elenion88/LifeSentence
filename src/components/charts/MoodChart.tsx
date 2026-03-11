import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

interface DataPoint { label: string; mood?: number; motivation?: number; }

export default function MoodChart({ data, height = 120 }: { data: DataPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3a4440" />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#8fa99a" }} tickLine={false} axisLine={false} />
        <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "#8fa99a" }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: "#242b29", border: "1px solid #3a4440", borderRadius: 6, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#8fa99a" }} />
        <Line type="monotone" dataKey="mood" stroke="#7ab087" strokeWidth={2} dot={false} name="Mood" connectNulls />
        <Line type="monotone" dataKey="motivation" stroke="#9e7ac4" strokeWidth={2} dot={false} name="Motivation" connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}
