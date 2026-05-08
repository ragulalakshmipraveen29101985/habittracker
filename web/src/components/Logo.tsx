export function Logo({ size = 22, dark = false }: { size?: number; dark?: boolean }) {
  const fill = dark ? "var(--paper)" : "var(--bg-text)";
  const stroke = dark ? "var(--paper)" : "var(--bg-text)";
  const accent = dark ? "var(--sage)" : "var(--ink)";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="9" height="9" rx="1.5" fill={fill} />
        <rect x="13" y="2" width="9" height="9" rx="1.5" fill="none" stroke={stroke} strokeWidth="1.6" />
        <rect x="2" y="13" width="9" height="9" rx="1.5" fill="none" stroke={stroke} strokeWidth="1.6" />
        <rect x="13" y="13" width="9" height="9" rx="1.5" fill={accent} />
      </svg>
      <span className="serif" style={{
        fontSize: size + 4, lineHeight: 1, letterSpacing: "-0.01em",
        color: dark ? "var(--paper)" : "var(--bg-text)",
      }}>Streak</span>
    </div>
  );
}
