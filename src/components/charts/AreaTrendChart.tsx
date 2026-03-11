import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DataPoint { label: string; percent: number; }

export default function AreaTrendChart({ data, color = "#5a8967", height = 100 }: { data: DataPoint[]; color?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#3a4440" />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#8fa99a" }} tickLine={false} axisLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#8fa99a" }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "#242b29", border: "1px solid #3a4440", borderRadius: 6, fontSize: 12 }}
          formatter={(v: number) => [`${v}%`, "Completion"]}
        />
        <Area type="monotone" dataKey="percent" stroke={color} strokeWidth={2} fill="url(#areaGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
