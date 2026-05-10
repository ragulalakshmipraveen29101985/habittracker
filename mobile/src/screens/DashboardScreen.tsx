import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable, ScrollView, Text, View, RefreshControl, Modal as RNModal, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Tracker } from "@streak/shared";
import {
  buildMonthDays, isCurrentMonth, MONTH_NAMES, accentColor, pct,
} from "@streak/shared";
import { Button } from "../components/Button";
import { Logo } from "../components/Logo";
import { Pill } from "../components/Pill";
import { Ring } from "../components/Ring";
import { MiniHeatmap } from "../components/MiniHeatmap";
import { colors, fonts } from "../theme/tokens";
import { useAuth } from "../state/AuthContext";
import { listTrackers, deleteTracker, fetchCompletions } from "../api";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

type CompletionsByTracker = Map<string, Map<string, Set<number>>>;

export function DashboardScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [completions, setCompletions] = useState<CompletionsByTracker>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const initial = ((user?.firstName || user?.name || user?.email) ?? "·")
    .charAt(0)
    .toUpperCase();

  const today = new Date();
  const Y = today.getFullYear();
  const M = today.getMonth();

  const load = useCallback(async () => {
    const ts = await listTrackers();
    setTrackers(ts);
    const days = buildMonthDays(Y, M);
    const from = days[0].iso;
    const to = days[days.length - 1].iso;
    const map: CompletionsByTracker = new Map();
    await Promise.all(ts.map(async (t) => {
      const comps = await fetchCompletions(t.id, from, to);
      const byHabit = new Map<string, Set<number>>();
      t.habits.forEach((h) => byHabit.set(h.id, new Set()));
      comps.forEach((c) => {
        const day = parseInt(c.date.slice(8, 10), 10);
        const set = byHabit.get(c.habitId) ?? new Set<number>();
        set.add(day);
        byHabit.set(c.habitId, set);
      });
      map.set(t.id, byHabit);
    }));
    setCompletions(map);
  }, [Y, M]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    const sub = navigation.addListener("focus", () => {
      load().catch(() => undefined);
    });
    return () => { cancelled = true; sub(); };
  }, [load, navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  }, [load]);

  const stats = useMemo(() => {
    let totalDone = 0, totalSlots = 0, longest = 0;
    trackers.forEach((t) => {
      const days = buildMonthDays(Y, M);
      const sameMonth = isCurrentMonth(Y, M);
      const cap = sameMonth ? today.getDate() : days.length;
      const byHabit = completions.get(t.id) ?? new Map();
      t.habits.forEach((h) => {
        const set: Set<number> = byHabit.get(h.id) ?? new Set();
        for (let d = 1; d <= cap; d++) {
          totalSlots++;
          if (set.has(d)) totalDone++;
        }
        let run = 0;
        for (let d = cap; d >= 1; d--) {
          if (set.has(d)) run++; else break;
        }
        longest = Math.max(longest, run);
      });
    });
    return { pct: pct(totalDone, totalSlots), totalDone, longest, count: trackers.length };
  }, [trackers, completions, Y, M]);

  const handleDelete = async (t: Tracker) => {
    Alert.alert(
      "Move to archive?",
      `"${t.name}" will move to your Archive. You can restore it later from your profile menu.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Move to archive",
          style: "destructive",
          onPress: async () => {
            await deleteTracker(t.id);
            setTrackers((prev) => prev.filter((x) => x.id !== t.id));
            setCompletions((prev) => {
              const next = new Map(prev);
              next.delete(t.id);
              return next;
            });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={{
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: 20, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: colors.line,
      }}>
        <Logo size={20} />
        <Pressable
          onPress={() => setMenuOpen(true)}
          accessibilityLabel="Open profile menu"
          style={{
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: colors.ink, alignItems: "center", justifyContent: "center",
          }}
        >
          <Text style={{ color: colors.paper, fontSize: 13, fontWeight: "500" }}>{initial}</Text>
        </Pressable>
      </View>

      <RNModal
        animationType="fade"
        transparent
        visible={menuOpen}
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          onPress={() => setMenuOpen(false)}
          style={{ flex: 1, backgroundColor: "rgba(27,26,22,0.45)", justifyContent: "flex-end" }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.paper,
              borderTopLeftRadius: 18, borderTopRightRadius: 18,
              padding: 8, paddingBottom: 28,
            }}
          >
            <View style={{ alignSelf: "center", width: 36, height: 4, borderRadius: 2, backgroundColor: colors.lineStrong, marginVertical: 8 }} />
            <MenuRow
              label="Profile"
              onPress={() => { setMenuOpen(false); navigation.navigate("Profile"); }}
            />
            <MenuRow
              label="Archive"
              onPress={() => { setMenuOpen(false); navigation.navigate("Archive"); }}
            />
            <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 4 }} />
            <MenuRow
              label="Sign out"
              tone="danger"
              onPress={() => { setMenuOpen(false); signOut(); }}
            />
          </Pressable>
        </Pressable>
      </RNModal>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={{
          fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.4,
          color: colors.inkMute, textTransform: "uppercase",
        }}>
          {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </Text>
        <Text style={{
          fontFamily: fonts.serif, fontSize: 36, color: colors.ink, marginTop: 8, lineHeight: 38,
        }}>
          Hello, {user?.name || "friend"}.
        </Text>
        <Text style={{ color: colors.inkSoft, marginTop: 6, fontSize: 14 }}>
          You've kept {stats.totalDone} ticks across {stats.count} tracker{stats.count === 1 ? "" : "s"} this month.
        </Text>

        <View style={{
          flexDirection: "row", justifyContent: "space-between",
          marginTop: 22, marginBottom: 22,
        }}>
          <Stat label="This month" value={`${stats.pct}%`} />
          <Stat label="Longest" value={`${stats.longest}d`} />
          <Stat label="Trackers" value={String(stats.count)} />
        </View>

        <View style={{
          flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12,
        }}>
          <Text style={{ fontFamily: fonts.serif, fontSize: 22, color: colors.ink }}>Your trackers</Text>
          <Button kind="primary" size="sm" title="+ New" onPress={() => navigation.navigate("CreateTracker")} />
        </View>

        {loading && <Text style={{ color: colors.inkMute }}>Loading…</Text>}

        {trackers.map((t) => (
          <TrackerCard
            key={t.id}
            tracker={t}
            year={Y}
            monthIdx={M}
            completedByHabit={completions.get(t.id) ?? new Map()}
            onPress={() => navigation.navigate("Tracker", { id: t.id })}
            onLongPress={() => handleDelete(t)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={{
        fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1,
        color: colors.inkMute, textTransform: "uppercase",
      }}>{label}</Text>
      <Text style={{ fontFamily: fonts.serif, fontSize: 26, color: colors.ink, marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
}

function TrackerCard({
  tracker, year, monthIdx, completedByHabit, onPress, onLongPress,
}: {
  tracker: Tracker;
  year: number; monthIdx: number;
  completedByHabit: Map<string, Set<number>>;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const days = buildMonthDays(year, monthIdx);
  const sameMonth = isCurrentMonth(year, monthIdx);
  const cap = sameMonth ? new Date().getDate() : days.length;
  let done = 0, total = 0;
  tracker.habits.forEach((h) => {
    const set = completedByHabit.get(h.id) ?? new Set();
    total += cap;
    for (let d = 1; d <= cap; d++) if (set.has(d)) done++;
  });
  const percent = pct(done, total);
  const ac = accentColor(tracker.accent);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => ({
        backgroundColor: colors.paper,
        borderColor: pressed ? colors.ink : colors.line,
        borderWidth: 1,
        borderRadius: 14,
        padding: 18,
        marginBottom: 14,
      })}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <View style={{
              width: 28, height: 28, borderRadius: 8, backgroundColor: ac,
              alignItems: "center", justifyContent: "center",
            }}>
              <Text style={{ color: colors.paper, fontSize: 14 }}>{tracker.emoji}</Text>
            </View>
            <Pill tone="cream">{MONTH_NAMES[monthIdx]} {year}</Pill>
          </View>
          <Text style={{ fontFamily: fonts.serif, fontSize: 22, color: colors.ink }}>{tracker.name}</Text>
          <Text style={{ color: colors.inkSoft, fontSize: 12.5, marginTop: 2 }}>
            {tracker.habits.length} habit{tracker.habits.length === 1 ? "" : "s"} · {cap} day{cap === 1 ? "" : "s"} tracked
          </Text>
        </View>
        <Ring value={percent} size={56} stroke={5} color={ac} />
      </View>

      <View style={{ marginTop: 14 }}>
        <Text style={{
          fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.2,
          color: colors.inkMute, textTransform: "uppercase", marginBottom: 6,
        }}>
          Days this month
        </Text>
        <MiniHeatmap
          tracker={tracker} year={year} monthIdx={monthIdx}
          completedByHabit={completedByHabit} color={ac}
        />
      </View>
      <Text style={{ marginTop: 10, fontSize: 11, color: colors.inkMute }}>
        Long-press to archive
      </Text>
    </Pressable>
  );
}

function MenuRow({
  label, onPress, tone,
}: {
  label: string;
  onPress: () => void;
  tone?: "danger";
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10,
        backgroundColor: pressed ? colors.cream : "transparent",
      })}
    >
      <Text style={{
        fontSize: 15, fontFamily: fonts.sans,
        color: tone === "danger" ? colors.coral : colors.ink,
      }}>{label}</Text>
    </Pressable>
  );
}
