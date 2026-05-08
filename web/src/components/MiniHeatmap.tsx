import { buildMonthDays, isCurrentMonth } from "@streak/shared";
import type { Tracker } from "@streak/shared";

interface Props {
  tracker: Tracker;
  year: number;
  monthIdx: number;
  /** habitId -> Set of day numbers completed that month */
  completedByHabit: Map<string, Set<number>>;
  color?: string;
}

export function MiniHeatmap({
  tracker,
  year,
  monthIdx,
  completedByHabit,
  color = "var(--sage-deep)",
}: Props) {
  const days = buildMonthDays(year, monthIdx);
  const today = new Date();
  const sameMonth = isCurrentMonth(year, monthIdx);
  const isPast = year < today.getFullYear() || (year === today.getFullYear() && monthIdx < today.getMonth());
  const cap = sameMonth ? today.getDate() : isPast ? days.length : 0;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(16, 1fr)",
      gap: 3,
    }}>
      {days.slice(0, cap).map((d) => {
        let done = 0;
        tracker.habits.forEach((h) => {
          if (completedByHabit.get(h.id)?.has(d.day)) done++;
        });
        const ratio = tracker.habits.length ? done / tracker.habits.length : 0;
        return (
          <span
            key={d.day}
            title={`Day ${d.day}: ${Math.round(ratio * 100)}%`}
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
}
