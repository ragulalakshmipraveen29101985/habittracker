import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable, ScrollView, Text, View, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { DayCell, Tracker } from "@streak/shared";
import {
  accentColor, MONTH_NAMES, DAY_SHORT, buildMonthDays, isCurrentMonth, pct,
} from "@streak/shared";
import { Button } from "../components/Button";
import { Ring } from "../components/Ring";
import { colors, fonts } from "../theme/tokens";
import {
  listTrackers, fetchCompletions, toggleCompletion,
} from "../api";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Tracker">;

const HABIT_COL = 150;
const CELL = 40;

export function TrackerScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const today = new Date();
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [year, setYear] = useState(today.getFullYear());
  const [monthIdx, setMonthIdx] = useState(today.getMonth());
  const [completed, setCompleted] = useState<Map<string, Set<number>>>(new Map());
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  const days = useMemo(() => buildMonthDays(year, monthIdx), [year, monthIdx]);
  const ac = useMemo(() => accentColor(tracker?.accent), [tracker]);
  const sameMonth = isCurrentMonth(year, monthIdx);
  const todayDay = sameMonth ? today.getDate() : null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const ts = await listTrackers();
        const t = ts.find((x) => x.id === id) ?? null;
        if (cancelled) return;
        setTracker(t);
        if (!t) return;
        const from = days[0].iso;
        const to = days[days.length - 1].iso;
        const comps = await fetchCompletions(t.id, from, to);
        if (cancelled) return;
        const byHabit = new Map<string, Set<number>>();
        t.habits.forEach((h) => byHabit.set(h.id, new Set()));
        comps.forEach((c) => {
          const d = parseInt(c.date.slice(8, 10), 10);
          const set = byHabit.get(c.habitId) ?? new Set<number>();
          set.add(d);
          byHabit.set(c.habitId, set);
        });
        setCompleted(byHabit);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, year, monthIdx]);

  const handleToggle = async (habitId: string, day: number) => {
    if (!tracker) return;
    const iso = days[day - 1]?.iso;
    if (!iso) return;
    const flip = () => setCompleted((prev) => {
      const next = new Map(prev);
      const set = new Set(next.get(habitId) ?? []);
      if (set.has(day)) set.delete(day); else set.add(day);
      next.set(habitId, set);
      return next;
    });
    flip();
    try { await toggleCompletion(habitId, iso); } catch { flip(); }
  };

  const summary = useMemo(() => {
    const cap = todayDay ?? days.length;
    let totalDone = 0, totalSlots = 0;
    const perDay: Record<number, number> = {};
    const perHabit: Record<string, number> = {};
    if (!tracker) return { cap, totalDone, totalSlots, pct: 0, perDay, perHabit };
    tracker.habits.forEach((h) => {
      const set = completed.get(h.id) ?? new Set<number>();
      let done = 0;
      for (let d = 1; d <= cap; d++) {
        totalSlots++;
        perDay[d] = perDay[d] || 0;
        if (set.has(d)) { totalDone++; done++; perDay[d]++; }
      }
      perHabit[h.id] = pct(done, cap);
    });
    return { cap, totalDone, totalSlots, pct: pct(totalDone, totalSlots), perDay, perHabit };
  }, [tracker, completed, days, todayDay]);

  const scrollToToday = () => {
    if (!todayDay) return;
    const x = (todayDay - 1) * CELL - 100;
    scrollRef.current?.scrollTo({ x: Math.max(0, x), animated: true });
  };

  const changeMonth = (delta: number) => {
    let m = monthIdx + delta, y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonthIdx(m);
    setYear(y);
  };

  if (loading && !tracker) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream, justifyContent: "center" }}>
        <ActivityIndicator color={colors.inkSoft} />
      </SafeAreaView>
    );
  }
  if (!tracker) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream, padding: 20 }}>
        <Text>Tracker not found.</Text>
        <Button kind="ghost" title="Back" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: colors.line,
      }}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.inkSoft, fontSize: 13 }}>← Trackers</Text>
        </Pressable>
        <Text style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.ink }} numberOfLines={1}>
          {tracker.emoji}  {tracker.name}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={{
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: 16, paddingVertical: 10,
      }}>
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 8,
          backgroundColor: colors.paper, borderColor: colors.line, borderWidth: 1,
          borderRadius: 999, padding: 4,
        }}>
          <Pressable onPress={() => changeMonth(-1)} style={navBtn}>
            <Text style={{ color: colors.inkSoft }}>‹</Text>
          </Pressable>
          <Text style={{ fontFamily: fonts.serif, fontSize: 15, paddingHorizontal: 6 }}>
            {MONTH_NAMES[monthIdx]} <Text style={{ color: colors.inkMute }}>{year}</Text>
          </Text>
          <Pressable onPress={() => changeMonth(1)} style={navBtn}>
            <Text style={{ color: colors.inkSoft }}>›</Text>
          </Pressable>
        </View>
        {todayDay && (
          <Button kind="ghost" size="sm" title="Today" onPress={scrollToToday} />
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{
          marginHorizontal: 16, marginBottom: 14,
          backgroundColor: colors.paper, borderColor: colors.line, borderWidth: 1,
          borderRadius: 12, padding: 16, flexDirection: "row",
          alignItems: "center", justifyContent: "space-between",
        }}>
          <View>
            <Text style={{
              fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1,
              color: colors.inkMute, textTransform: "uppercase",
            }}>Completion</Text>
            <Text style={{ fontFamily: fonts.serif, fontSize: 30, color: colors.ink, marginTop: 2 }}>
              {summary.pct}%
            </Text>
            <Text style={{ fontSize: 12, color: colors.inkSoft }}>
              {summary.totalDone} of {summary.totalSlots} ticks
            </Text>
          </View>
          <Ring value={summary.pct} size={62} stroke={5} color={ac} />
        </View>

        <Text style={{
          fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1.2,
          color: colors.inkMute, textTransform: "uppercase",
          marginHorizontal: 16, marginBottom: 6,
        }}>
          The grid · tap a cell
        </Text>

        <View style={{
          marginHorizontal: 16, backgroundColor: colors.paper,
          borderColor: colors.line, borderWidth: 1, borderRadius: 14, overflow: "hidden",
          flexDirection: "row",
        }}>
          {/* sticky habit column */}
          <View style={{ width: HABIT_COL, borderRightWidth: 1, borderRightColor: colors.line }}>
            {/* header */}
            <View style={{
              backgroundColor: colors.navy, paddingVertical: 12, paddingHorizontal: 12, height: 56,
              justifyContent: "center",
            }}>
              <Text style={{
                color: colors.paper, fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1.2,
              }}>HABITS</Text>
            </View>
            {tracker.habits.map((h, hi) => (
              <View
                key={h.id}
                style={{
                  height: CELL, paddingHorizontal: 12, justifyContent: "center",
                  backgroundColor: hi % 2 === 0 ? colors.paper : "rgba(236,229,214,0.35)",
                  borderTopWidth: 1, borderTopColor: colors.line,
                }}
              >
                <Text numberOfLines={1} style={{ fontSize: 12.5, color: colors.ink, fontWeight: "500" }}>
                  {h.name}
                </Text>
              </View>
            ))}
            {/* footer */}
            <View style={{
              height: CELL, paddingHorizontal: 12, justifyContent: "center",
              backgroundColor: colors.cream2, borderTopWidth: 1.5, borderTopColor: colors.lineStrong,
            }}>
              <Text style={{
                fontFamily: fonts.mono, fontSize: 10, color: colors.inkMute, letterSpacing: 1, textTransform: "uppercase",
              }}>Day total</Text>
            </View>
          </View>

          {/* horizontally scrolling matrix */}
          <ScrollView
            horizontal
            ref={scrollRef}
            showsHorizontalScrollIndicator={false}
          >
            <View>
              <View style={{ flexDirection: "row" }}>
                {days.map((d) => (
                  <View
                    key={d.day}
                    style={{
                      width: CELL, height: 56,
                      backgroundColor: d.day === todayDay ? ac : colors.navy2,
                      alignItems: "center", justifyContent: "center",
                      borderLeftWidth: d.day === 1 ? 0 : 1,
                      borderLeftColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <Text style={{ color: colors.paper, fontSize: 9, opacity: 0.78 }}>
                      {DAY_SHORT[d.weekday]}
                    </Text>
                    <Text style={{
                      color: colors.paper, fontFamily: fonts.mono, fontSize: 12, marginTop: 2,
                    }}>{d.day}</Text>
                  </View>
                ))}
              </View>

              {tracker.habits.map((h, hi) => {
                const set = completed.get(h.id) ?? new Set<number>();
                return (
                  <View key={h.id} style={{ flexDirection: "row" }}>
                    {days.map((d) => {
                      const done = set.has(d.day);
                      const isToday = d.day === todayDay;
                      return (
                        <Pressable
                          key={`${h.id}-${d.day}`}
                          onPress={() => handleToggle(h.id, d.day)}
                          style={({ pressed }) => ({
                            width: CELL, height: CELL,
                            backgroundColor: hi % 2 === 0 ? colors.paper : "rgba(236,229,214,0.35)",
                            borderLeftWidth: d.day === 1 ? 0 : 1, borderLeftColor: colors.line,
                            borderTopWidth: 1, borderTopColor: colors.line,
                            alignItems: "center", justifyContent: "center",
                            opacity: pressed ? 0.7 : 1,
                          })}
                        >
                          <View style={{
                            width: 22, height: 22, borderRadius: 5,
                            borderWidth: 1.5,
                            borderColor: done ? ac : colors.lineStrong,
                            backgroundColor: done ? ac : "transparent",
                            alignItems: "center", justifyContent: "center",
                          }}>
                            {done && (
                              <Text style={{ color: colors.paper, fontSize: 14, lineHeight: 16 }}>✓</Text>
                            )}
                          </View>
                          {isToday && (
                            <View style={{
                              position: "absolute", left: 0, right: 0, bottom: 0, height: 2, backgroundColor: ac,
                            }} />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                );
              })}

              <View style={{ flexDirection: "row" }}>
                {days.map((d) => {
                  const c = summary.perDay[d.day] || 0;
                  const total = tracker.habits.length;
                  const p = pct(c, total);
                  const inFuture = todayDay !== null && d.day > todayDay;
                  return (
                    <View
                      key={`tot-${d.day}`}
                      style={{
                        width: CELL, height: CELL,
                        backgroundColor: colors.cream2,
                        borderTopWidth: 1.5, borderTopColor: colors.lineStrong,
                        borderLeftWidth: d.day === 1 ? 0 : 1, borderLeftColor: colors.line,
                        alignItems: "center", justifyContent: "center",
                        opacity: inFuture ? 0.35 : 1,
                      }}
                    >
                      <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.ink }}>
                        {inFuture ? "–" : c}
                      </Text>
                      <Text style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.inkMute }}>
                        {inFuture ? "" : `${p}%`}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>

        <Text style={{ fontSize: 12, color: colors.inkMute, textAlign: "center", marginTop: 14 }}>
          Tap a cell to toggle. Pull down to refresh.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const navBtn = {
  width: 28, height: 28, borderRadius: 14,
  alignItems: "center" as const, justifyContent: "center" as const,
};
