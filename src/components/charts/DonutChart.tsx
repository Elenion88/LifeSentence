import { PieChart, Pie, Cell } from "recharts";

interface Props {
  percent: number;
  size?: number;
  color?: string;
  label?: string;
  thickness?: number;
}

export default function DonutChart({ percent, size = 80, color = "var(--accent)", label, thickness = 10 }: Props) {
  const data = [{ value: percent }, { value: Math.max(0, 100 - percent) }];
  const innerRadius = size / 2 - thickness;
  const outerRadius = size / 2 - 2;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          cx={size / 2 - 1}
          cy={size / 2 - 1}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          strokeWidth={0}
        >
          <Cell fill={color} />
          <Cell fill="#3a4440" />
        </Pie>
      </PieChart>
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <span style={{ fontSize: size * 0.2, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
          {percent}%
        </span>
        {label && (
          <span style={{ fontSize: size * 0.13, color: "var(--text-muted)", marginTop: 1, textAlign: "center", lineHeight: 1.1 }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
