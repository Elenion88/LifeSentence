import { useState, useMemo } from "react";
import { format, addDays, subDays, addMonths, subMonths, eachDayOfInterval } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getMonthDates, toDateStr } from "../../lib/dates";
import { buildCompletionMap, getDayPercent, getCurrentStreak } from "../../lib/stats";
import { CATEGORIES } from "../../constants/categories";
import AreaTrendChart from "../../components/charts/AreaTrendChart";
import MoodChart from "../../components/charts/MoodChart";
import { useIsMobile } from "../../hooks/useIsMobile";
import { Id } from "../../../convex/_generated/dataModel";

type TrackingWindow = 3 | 5 | 7 | 14 | "month";
const WINDOWS: TrackingWindow[] = [3, 5, 7, 14, "month"];
const WINDOW_LABELS: Record<string | number, string> = { 3: "3d", 5: "5d", 7: "7d", 14: "14d", month: "Month" };

export default function TrackerView() {
  const isMobile = useIsMobile();
  const today = toDateStr(new Date());

  const [viewWindow, setViewWindow] = useState<TrackingWindow>(() =>
    window.innerWidth < 640 ? 7 : "month"
  );
  // For N-day windows, refDate is the last day shown. For month, it's any day in the month.
  const [refDate, setRefDate] = useState(new Date());

  const dates = useMemo(() => {
    if (viewWindow === "month") {
      return getMonthDates(refDate.getFullYear(), refDate.getMonth());
    }
    const end = refDate;
    const start = subDays(end, (viewWindow as number) - 1);
    return eachDayOfInterval({ start, end });
  }, [viewWindow, refDate]);

  const startDateStr = toDateStr(dates[0]);
  const endDateStr = toDateStr(dates[dates.length - 1]);

  const habits = useQuery(api.habits.getActive);
  const completions = useQuery(api.completions.getForDateRange, { startDate: startDateStr, endDate: endDateStr });
  const moodData = useQuery(api.mood.getForDateRange, { startDate: startDateStr, endDate: endDateStr });

  const completionMap = useMemo(() => buildCompletionMap(completions ?? []), [completions]);
  const toggle = useMutation(api.completions.toggle);

  const habitsByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    habits: (habits ?? []).filter((h) => h.category === cat.name),
  })).filter((c) => c.habits.length > 0);

  const allHabitIds = (habits ?? []).map((h) => h._id as string);
  const completedTotal = completions?.filter((c) => c.completed).length ?? 0;
  const eligibleDays = dates.filter((d) => toDateStr(d) <= today).length;
  const totalPossible = allHabitIds.length * eligibleDays;
  const progressPct = totalPossible > 0 ? Math.round((completedTotal / totalPossible) * 100) : 0;

  const shortLabel = viewWindow === "month" || dates.length > 14;
  const trendData = dates.map((d) => ({
    label: shortLabel ? format(d, "d") : format(d, "MMM d"),
    percent: getDayPercent(toDateStr(d), allHabitIds, completionMap),
  }));
  const moodChartData = dates.map((d) => {
    const ds = toDateStr(d);
    const entry = moodData?.find((m) => m.date === ds);
    return { label: shortLabel ? format(d, "d") : format(d, "MMM d"), mood: entry?.mood, motivation: entry?.motivation };
  });

  const goBack = () => {
    if (viewWindow === "month") setRefDate(subMonths(refDate, 1));
    else setRefDate(subDays(refDate, viewWindow as number));
  };
  const goForward = () => {
    if (viewWindow === "month") {
      setRefDate(addMonths(refDate, 1));
    } else {
      const next = addDays(refDate, viewWindow as number);
      setRefDate(next > new Date() ? new Date() : next);
    }
  };
  const canGoForward = viewWindow === "month" || toDateStr(refDate) < today;

  const headerLabel = viewWindow === "month"
    ? format(refDate, "MMMM yyyy")
    : `${format(dates[0], "MMM d")} – ${format(dates[dates.length - 1], "MMM d")}`;

  // Responsive table dimensions
  const nameColWidth = isMobile ? 100 : 180;
  const dayColWidth = isMobile
    ? ((viewWindow as number) <= 5 ? 40 : (viewWindow as number) <= 7 ? 32 : 24)
    : 22;
  const showStreak = !isMobile;

  const navBtnStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    width: 40,
    height: 40,
    minWidth: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "var(--text-primary)",
    flexShrink: 0,
  };

  return (
    <div>
      {/* Window selector */}
      <div style={{
        display: "flex",
        gap: isMobile ? 6 : 4,
        marginBottom: 12,
        justifyContent: isMobile ? "center" : "flex-start",
      }}>
        {WINDOWS.map((w) => (
          <button
            key={w}
            onClick={() => {
              if (w !== "month") setRefDate(new Date());
              setViewWindow(w);
            }}
            style={{
              padding: isMobile ? "8px 12px" : "6px 12px",
              borderRadius: 20,
              border: `1px solid ${viewWindow === w ? "var(--accent)" : "var(--border)"}`,
              background: viewWindow === w ? "var(--accent)" : "var(--surface)",
              color: viewWindow === w ? "white" : "var(--text-muted)",
              fontSize: 13,
              fontWeight: viewWindow === w ? 600 : 400,
              cursor: "pointer",
              minWidth: isMobile ? 44 : 40,
              minHeight: isMobile ? 44 : "auto",
            }}
          >
            {WINDOW_LABELS[w]}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={goBack} style={navBtnStyle}><ChevronLeft size={18} /></button>
        <h2 style={{ flex: 1, textAlign: "center", fontSize: isMobile ? 16 : 20, fontWeight: 700, margin: 0 }}>
          {headerLabel}
        </h2>
        <button
          onClick={goForward}
          disabled={!canGoForward}
          style={{ ...navBtnStyle, opacity: canGoForward ? 1 : 0.3, cursor: canGoForward ? "pointer" : "default" }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Stats bar */}
      <div style={{
        display: "flex",
        gap: 12,
        marginBottom: 16,
        padding: isMobile ? "10px 14px" : "12px 16px",
        background: "var(--surface)",
        borderRadius: 10,
        border: "1px solid var(--border)",
      }}>
        {[
          { label: "Habits", value: allHabitIds.length },
          { label: "Done", value: completedTotal },
          { label: "Progress", value: `${progressPct}%` },
        ].map(({ label, value }) => (
          <div key={label} style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
            <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: "var(--accent)" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Habit grid */}
      <div style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", overflow: "auto", marginBottom: 16 }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: isMobile ? 12 : 11 }}>
          <thead>
            <tr>
              <th style={{
                width: nameColWidth, minWidth: nameColWidth,
                padding: isMobile ? "8px 8px" : "8px 12px",
                textAlign: "left", color: "var(--text-muted)", fontWeight: 600,
                borderBottom: "1px solid var(--border)",
                position: "sticky", left: 0, background: "var(--surface)", zIndex: 1,
              }}>Habit</th>
              {dates.map((d) => {
                const ds = toDateStr(d);
                return (
                  <th key={ds} style={{
                    width: dayColWidth, minWidth: dayColWidth,
                    padding: "4px 1px", textAlign: "center",
                    color: ds === today ? "var(--accent)" : "var(--text-muted)",
                    fontWeight: ds === today ? 700 : 400,
                    borderBottom: "1px solid var(--border)",
                    fontSize: isMobile ? 10 : 10,
                    lineHeight: 1.3,
                  }}>
                    {isMobile && (viewWindow as number) <= 7
                      ? <>{format(d, "EEE")}<br />{format(d, "d")}</>
                      : format(d, "d")
                    }
                  </th>
                );
              })}
              {showStreak && (
                <th style={{ width: 70, padding: "8px 8px", textAlign: "center", color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>Streak</th>
              )}
              <th style={{ width: 36, padding: "8px 4px", textAlign: "center", color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>%</th>
            </tr>
          </thead>
          <tbody>
            {habitsByCategory.map((cat) => (
              <>
                <tr key={`cat-${cat.name}`}>
                  <td
                    colSpan={dates.length + (showStreak ? 3 : 2)}
                    style={{
                      padding: isMobile ? "5px 8px" : "6px 12px",
                      fontSize: 11, fontWeight: 700, color: cat.color,
                      background: cat.bg, textTransform: "uppercase", letterSpacing: 0.8,
                    }}
                  >
                    {cat.name}
                  </td>
                </tr>
                {cat.habits.map((habit) => {
                  const completedDays = dates.filter((d) => completionMap[toDateStr(d)]?.[habit._id]).length;
                  const habEligible = dates.filter((d) => toDateStr(d) <= today).length;
                  const pct = habEligible > 0 ? Math.round((completedDays / habEligible) * 100) : 0;
                  const streak = getCurrentStreak(habit._id, completions ?? []);
                  const btnSize = isMobile ? ((viewWindow as number) <= 7 ? 28 : 20) : 18;
                  return (
                    <tr key={habit._id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{
                        padding: isMobile ? "4px 8px" : "4px 12px",
                        color: "var(--text-primary)",
                        position: "sticky", left: 0, background: "var(--surface)", zIndex: 1,
                        width: nameColWidth, maxWidth: nameColWidth,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        minHeight: isMobile ? 44 : "auto",
                        height: isMobile ? 44 : "auto",
                      }}>
                        {habit.name}
                      </td>
                      {dates.map((d) => {
                        const ds = toDateStr(d);
                        const done = completionMap[ds]?.[habit._id] ?? false;
                        const isFuture = ds > today;
                        return (
                          <td key={ds} style={{ textAlign: "center", padding: "2px 1px" }}>
                            <button
                              onClick={() => !isFuture && toggle({ habitId: habit._id as Id<"habits">, date: ds, completed: !done })}
                              style={{
                                width: btnSize, height: btnSize, borderRadius: 4,
                                border: `1.5px solid ${done ? cat.color : "var(--border)"}`,
                                background: done ? cat.color : "transparent",
                                cursor: isFuture ? "default" : "pointer",
                                opacity: isFuture ? 0.3 : 1,
                                display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
                                touchAction: "manipulation",
                              }}
                            >
                              {done && <span style={{ color: "white", fontSize: isMobile ? 12 : 10, lineHeight: 1 }}>✓</span>}
                            </button>
                          </td>
                        );
                      })}
                      {showStreak && (
                        <td style={{ textAlign: "center", color: streak > 0 ? "var(--accent-light)" : "var(--text-muted)", fontWeight: streak > 0 ? 700 : 400, fontSize: 11 }}>
                          {streak > 0 ? `🔥 ${streak}d` : "—"}
                        </td>
                      )}
                      <td style={{ textAlign: "center", color: pct >= 70 ? "var(--accent)" : "var(--text-muted)", fontWeight: 600, fontSize: 11 }}>{pct}%</td>
                    </tr>
                  );
                })}
              </>
            ))}
            <tr style={{ borderTop: "2px solid var(--border)" }}>
              <td style={{
                padding: isMobile ? "6px 8px" : "6px 12px",
                color: "var(--text-muted)", fontWeight: 600,
                position: "sticky", left: 0, background: "var(--surface)", fontSize: 11,
              }}>
                Daily %
              </td>
              {dates.map((d) => {
                const ds = toDateStr(d);
                const pct = getDayPercent(ds, allHabitIds, completionMap);
                const isFuture = ds > today;
                return (
                  <td key={ds} style={{ textAlign: "center", padding: "4px 1px" }}>
                    {!isFuture && (
                      <div style={{ fontSize: 9, color: pct >= 70 ? "var(--accent)" : "var(--text-muted)", fontWeight: 600 }}>{pct}</div>
                    )}
                  </td>
                );
              })}
              {showStreak && <td colSpan={2} />}
              {!showStreak && <td />}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Charts */}
      <div style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", padding: 16, marginBottom: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 8px" }}>Completion Trend</p>
        <AreaTrendChart data={trendData} />
      </div>

      <div style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", padding: 16, marginBottom: isMobile ? 8 : 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 8px" }}>Mood & Motivation</p>
        <MoodChart data={moodChartData} />
      </div>
    </div>
  );
}
