interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  color?: string;
}

const TRACK_W = 50;
const TRACK_H = 28;
const KNOB = 22;
const KNOB_MARGIN = (TRACK_H - KNOB) / 2;
const TRAVEL = TRACK_W - KNOB - KNOB_MARGIN * 2;

// Spring overshoot easing — feels like a physical click
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export default function Toggle({ checked, onChange, color = "var(--accent)" }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      style={{
        // Generous hit area
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 6px",
        background: "none",
        border: "none",
        cursor: "pointer",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        minWidth: 44,
        minHeight: 44,
      }}
    >
      {/* Track */}
      <span style={{
        position: "relative",
        display: "inline-block",
        width: TRACK_W,
        height: TRACK_H,
        borderRadius: TRACK_H / 2,
        background: checked ? color : "var(--surface-2)",
        border: `1.5px solid ${checked ? color : "var(--border)"}`,
        transition: `background 220ms ${SPRING}, border-color 220ms ${SPRING}`,
        flexShrink: 0,
      }}>
        {/* Knob */}
        <span style={{
          position: "absolute",
          top: KNOB_MARGIN - 1.5,   // offset for border
          left: KNOB_MARGIN - 1.5,
          width: KNOB,
          height: KNOB,
          borderRadius: "50%",
          background: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
          transform: checked ? `translateX(${TRAVEL}px)` : "translateX(0)",
          transition: `transform 280ms ${SPRING}, box-shadow 200ms ease`,
        }} />
      </span>
    </button>
  );
}
