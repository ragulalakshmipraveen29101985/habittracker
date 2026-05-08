import type { DayCell } from "@streak/shared";
import { DAY_SHORT } from "@streak/shared";

interface Props {
  days: DayCell[];
  completed: Set<number>;
  color?: string;
  size?: number;
  gap?: number;
}

export function WeekDots({
  days,
  completed,
  color = "var(--sage-deep)",
  size = 10,
  gap = 4,
}: Props) {
  return (
    <div style={{ display: "flex", gap, alignItems: "center" }}>
      {days.map((d) => {
        const done = completed.has(d.day);
        return (
          <span
            key={d.day}
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
      {Array.from({ length: 7 - days.length }).map((_, i) => (
        <span key={`p${i}`} style={{ width: size, height: size, opacity: 0 }} />
      ))}
    </div>
  );
}
