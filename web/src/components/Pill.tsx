import type { ReactNode } from "react";

type Tone = "ink" | "sage" | "cream" | "coral";

const TONES: Record<Tone, { bg: string; fg: string }> = {
  ink:   { bg: "var(--ink)",       fg: "var(--paper)" },
  sage:  { bg: "var(--sage-soft)", fg: "var(--sage-deep)" },
  cream: { bg: "var(--cream-2)",   fg: "var(--ink-soft)" },
  coral: { bg: "#F4DDD2",          fg: "var(--coral)" },
};

export function Pill({ children, tone = "ink" }: { children: ReactNode; tone?: Tone }) {
  const t = TONES[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 9px", borderRadius: 999,
      background: t.bg, color: t.fg,
      fontSize: 11.5, fontFamily: "var(--mono)", letterSpacing: 0.2,
    }}>{children}</span>
  );
}
