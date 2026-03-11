import { NavLink } from "react-router-dom";
import { Calendar, BarChart2, CalendarDays, Settings, Leaf } from "lucide-react";

const nav = [
  { to: "/week", icon: CalendarDays, label: "Weekly" },
  { to: "/month", icon: Calendar, label: "Monthly" },
  { to: "/analytics", icon: BarChart2, label: "Analytics" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  return (
    <nav style={{
      width: 220,
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "24px 12px",
      gap: 4,
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 12px 24px" }}>
        <Leaf size={22} color="var(--accent)" />
        <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>LifeSentence</span>
      </div>
      {nav.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 8,
            textDecoration: "none",
            color: isActive ? "var(--accent-light)" : "var(--text-muted)",
            background: isActive ? "var(--surface-2)" : "transparent",
            fontWeight: isActive ? 600 : 400,
            fontSize: 14,
            transition: "all 0.15s",
          })}
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
