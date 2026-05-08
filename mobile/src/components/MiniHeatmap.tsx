import { View } from "react-native";
import type { Tracker } from "@streak/shared";
import { buildMonthDays, isCurrentMonth } from "@streak/shared";
import { colors } from "../theme/tokens";

interface Props {
  tracker: Tracker;
  year: number;
  monthIdx: number;
  completedByHabit: Map<string, Set<number>>;
  color?: string;
}

export function MiniHeatmap({
  tracker, year, monthIdx, completedByHabit, color = colors.sageDeep,
}: Props) {
  const days = buildMonthDays(year, monthIdx);
  const today = new Date();
  const sameMonth = isCurrentMonth(year, monthIdx);
  const isPast =
    year < today.getFullYear() ||
    (year === today.getFullYear() && monthIdx < today.getMonth());
  const cap = sameMonth ? today.getDate() : isPast ? days.length : 0;

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 3 }}>
      {days.slice(0, cap).map((d) => {
        let done = 0;
        tracker.habits.forEach((h) => {
          if (completedByHabit.get(h.id)?.has(d.day)) done++;
        });
        const ratio = tracker.habits.length ? done / tracker.habits.length : 0;
        return (
          <View
            key={d.day}
            style={{
              width: 14, height: 14, borderRadius: 2,
              backgroundColor: ratio > 0 ? color : "transparent",
              opacity: ratio > 0 ? 0.18 + ratio * 0.82 : 1,
              borderWidth: ratio > 0 ? 0 : 1,
              borderColor: colors.line,
            }}
          />
        );
      })}
    </View>
  );
}
