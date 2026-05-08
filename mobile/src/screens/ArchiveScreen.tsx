import { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList, Pressable, Text, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { accentColor } from "@streak/shared";
import type { Tracker } from "@streak/shared";
import { Button } from "../components/Button";
import { colors, fonts } from "../theme/tokens";
import {
  listArchivedTrackers, unarchiveTracker, deleteTracker,
} from "../api";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Archive">;

export function ArchiveScreen({ navigation }: Props) {
  const [items, setItems] = useState<Tracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listArchivedTrackers();
        if (!cancelled) setItems(list);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const onUnarchive = async (id: string) => {
    try {
      await unarchiveTracker(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      Alert.alert("Couldn't unarchive", e instanceof Error ? e.message : "Try again later.");
    }
  };

  const onDeleteForever = (t: Tracker) => {
    Alert.alert(
      "Delete forever?",
      `"${t.name}" will be permanently removed. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete forever",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTracker(t.id);
              setItems((prev) => prev.filter((x) => x.id !== t.id));
            } catch (e) {
              Alert.alert("Couldn't delete", e instanceof Error ? e.message : "Try again later.");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={{
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: colors.line,
      }}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.inkSoft, fontSize: 13 }}>← Trackers</Text>
        </Pressable>
        <Text style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.ink }}>Archive</Text>
        <View style={{ width: 70 }} />
      </View>

      <View style={{ padding: 20 }}>
        <Text style={{
          fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1.2,
          color: colors.inkMute, textTransform: "uppercase",
        }}>ARCHIVE</Text>
        <Text style={{ fontFamily: fonts.serif, fontSize: 28, marginTop: 6, color: colors.ink }}>
          Trackers you've set aside.
        </Text>
      </View>

      {loading ? (
        <View style={{ padding: 20 }}><ActivityIndicator color={colors.inkSoft} /></View>
      ) : err ? (
        <Text style={{ color: colors.coral, padding: 20 }}>{err}</Text>
      ) : items.length === 0 ? (
        <View style={{
          marginHorizontal: 20, padding: 24,
          borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.lineStrong,
          borderRadius: 14, alignItems: "center",
        }}>
          <Text style={{ fontFamily: fonts.serif, fontSize: 20, color: colors.inkSoft }}>
            Nothing archived yet.
          </Text>
          <Text style={{ marginTop: 6, fontSize: 13, color: colors.inkMute, textAlign: "center" }}>
            Trackers you archive will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <ArchiveRow
              tracker={item}
              onUnarchive={() => onUnarchive(item.id)}
              onDelete={() => onDeleteForever(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function ArchiveRow({
  tracker, onUnarchive, onDelete,
}: {
  tracker: Tracker;
  onUnarchive: () => void;
  onDelete: () => void;
}) {
  const ac = accentColor(tracker.accent);
  return (
    <View style={{
      backgroundColor: colors.paper, borderColor: colors.line, borderWidth: 1,
      borderRadius: 14, padding: 14,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{
          width: 32, height: 32, borderRadius: 8, backgroundColor: ac,
          alignItems: "center", justifyContent: "center",
        }}>
          <Text style={{ color: colors.paper, fontSize: 15 }}>{tracker.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.ink }} numberOfLines={1}>
            {tracker.name}
          </Text>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.inkMute, marginTop: 2 }}>
            {tracker.habits.length} habit{tracker.habits.length === 1 ? "" : "s"}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        <View style={{ flex: 1 }}>
          <Button kind="secondary" size="sm" title="Unarchive" onPress={onUnarchive} />
        </View>
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => ({
            paddingVertical: 7, paddingHorizontal: 14, borderRadius: 999,
            borderWidth: 1, borderColor: pressed ? colors.coral : "transparent",
            alignItems: "center", justifyContent: "center",
          })}
        >
          <Text style={{ color: colors.coral, fontSize: 12.5, fontWeight: "500" }}>
            Delete forever
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
