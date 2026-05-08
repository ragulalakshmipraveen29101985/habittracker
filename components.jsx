// Shared small UI components: buttons, icons, ring chart, dot grid.

const Icon = ({ name, size = 16, stroke = 1.6, ...rest }) => {
  const s = size;
  const common = {
    width: s, height: s, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor",
    strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round",
    ...rest,
  };
  switch (name) {
    case "plus":   return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    case "check":  return <svg {...common}><path d="M4 12l5 5L20 6" /></svg>;
    case "x":      return <svg {...common}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case "back":   return <svg {...common}><path d="M15 6l-6 6 6 6" /></svg>;
    case "chev":   return <svg {...common}><path d="M9 6l6 6-6 6" /></svg>;
    case "down":   return <svg {...common}><path d="M6 9l6 6 6-6" /></svg>;
    case "edit":   return <svg {...common}><path d="M4 20h4l10-10-4-4L4 16v4z" /><path d="M14 6l4 4" /></svg>;
    case "trash":  return <svg {...common}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>;
    case "search": return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>;
    case "calendar": return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    case "settings": return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>;
    case "logout": return <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
    case "flame":  return <svg {...common}><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 9 8 12 8 14a4 4 0 0 0 8 0c0-3-2-5-4-12z"/></svg>;
    case "sparkle":return <svg {...common}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3"/></svg>;
    case "grid":   return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case "dots":   return <svg {...common}><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>;
    default: return null;
  }
};

const Button = ({ kind = "primary", size = "md", icon, children, ...rest }) => {
  const base = {
    border: "1px solid transparent",
    borderRadius: 999,
    fontSize: size === "sm" ? 12.5 : 13.5,
    fontWeight: 500,
    letterSpacing: 0.1,
    padding: size === "sm" ? "7px 14px" : "10px 18px",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    transition: "all .14s ease",
    whiteSpace: "nowrap",
  };
  const styles = {
    primary: { ...base, background: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" },
    secondary: { ...base, background: "transparent", color: "var(--ink)", borderColor: "var(--line-strong)" },
    ghost: { ...base, background: "transparent", color: "var(--ink)", borderColor: "transparent" },
    sage: { ...base, background: "var(--sage-deep)", color: "#fff", borderColor: "var(--sage-deep)" },
    danger: { ...base, background: "transparent", color: "var(--coral)", borderColor: "transparent" },
  };
  return (
    <button style={styles[kind]} {...rest}>
      {icon && <Icon name={icon} size={size === "sm" ? 13 : 15} />}
      {children}
    </button>
  );
};

// A 7-dot row showing one habit's completion across one week.
const WeekDots = ({ days, completed, color = "var(--sage-deep)", size = 10, gap = 4 }) => {
  return (
    <div style={{ display: "flex", gap, alignItems: "center" }}>
      {days.map((d) => {
        const done = completed.has(d.day);
        return (
          <span key={d.day}
            title={`${DAY_SHORT[d.weekday]} ${d.day}: ${done ? "done" : "missed"}`}
            style={{
              width: size, height: size, borderRadius: 2,
              background: done ? color : "transparent",
              border: done ? `1px solid ${color}` : "1px solid var(--line-strong)",
              display: "inline-block",
            }}
          />
        );
      })}
      {/* pad short final week */}
      {Array.from({ length: 7 - days.length }).map((_, i) => (
        <span key={`p${i}`} style={{ width: size, height: size, opacity: 0 }} />
      ))}
    </div>
  );
};

// Circular progress ring for a percentage.
const Ring = ({ value, size = 64, stroke = 6, color = "var(--sage-deep)", track = "var(--line)", label }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: "stroke-dashoffset .35s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "grid", placeItems: "center",
        fontFamily: "var(--mono)", fontSize: size < 56 ? 10 : 12, color: "var(--ink-soft)",
      }}>
        {label ?? `${Math.round(value)}%`}
      </div>
    </div>
  );
};

// Stylized heatmap (mini, used on dashboard cards): grid of squares, opacity ~ completion.
const MiniHeatmap = ({ tracker, completions, color = "var(--sage-deep)" }) => {
  const days = buildMonthDays(tracker.year, tracker.monthIdx);
  const today = new Date();
  const sameMonth = today.getFullYear() === tracker.year && today.getMonth() === tracker.monthIdx;
  const cap = sameMonth ? today.getDate() : days.length;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(16, 1fr)",
      gap: 3,
    }}>
      {days.slice(0, cap).map((d) => {
        let done = 0;
        tracker.habits.forEach((h) => {
          if (completions[h.id]?.has(d.day)) done++;
        });
        const ratio = tracker.habits.length ? done / tracker.habits.length : 0;
        return (
          <span key={d.day} title={`Day ${d.day}: ${Math.round(ratio*100)}%`}
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              background: ratio > 0 ? color : "transparent",
              opacity: ratio > 0 ? 0.18 + ratio * 0.82 : 1,
              border: ratio > 0 ? "none" : "1px solid var(--line)",
              borderRadius: 2,
            }}
          />
        );
      })}
    </div>
  );
};

const Logo = ({ size = 22 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="9" height="9" rx="1.5" fill="var(--ink)" />
      <rect x="13" y="2" width="9" height="9" rx="1.5" fill="none" stroke="var(--ink)" strokeWidth="1.6"/>
      <rect x="2" y="13" width="9" height="9" rx="1.5" fill="none" stroke="var(--ink)" strokeWidth="1.6"/>
      <rect x="13" y="13" width="9" height="9" rx="1.5" fill="var(--sage-deep)"/>
    </svg>
    <span className="serif" style={{ fontSize: size + 4, lineHeight: 1, letterSpacing: "-0.01em" }}>Streak</span>
  </div>
);

// Toast / inline pill
const Pill = ({ children, tone = "ink" }) => {
  const tones = {
    ink:   { bg: "var(--ink)", fg: "var(--paper)" },
    sage:  { bg: "var(--sage-soft)", fg: "var(--sage-deep)" },
    cream: { bg: "var(--cream-2)", fg: "var(--ink-soft)" },
    coral: { bg: "#F4DDD2", fg: "var(--coral)" },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 9px", borderRadius: 999,
      background: t.bg, color: t.fg,
      fontSize: 11.5, fontFamily: "var(--mono)", letterSpacing: 0.2,
    }}>{children}</span>
  );
};

Object.assign(window, { Icon, Button, WeekDots, Ring, MiniHeatmap, Logo, Pill });
