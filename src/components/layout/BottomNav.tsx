import { NavLink } from "react-router-dom";
import { Calendar, BarChart2, Sun, Settings } from "lucide-react";

const nav = [
  { to: "/week", icon: Sun, label: "Today" },
  { to: "/tracker", icon: Calendar, label: "Tracker" },
  { to: "/analytics", icon: BarChart2, label: "Analytics" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function BottomNav() {
  return (
    <nav style={{
      display: "flex",
      background: "var(--surface)",
      borderTop: "1px solid var(--border)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      flexShrink: 0,
    }}>
      {nav.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            padding: "10px 0",
            textDecoration: "none",
            color: isActive ? "var(--accent-light)" : "var(--text-muted)",
            minHeight: 56,
          })}
        >
          <Icon size={22} />
          <span style={{ fontSize: 10, fontWeight: 500 }}>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
