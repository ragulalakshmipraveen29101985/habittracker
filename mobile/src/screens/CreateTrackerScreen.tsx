import { useState } from "react";
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ACCENT_OPTIONS, EMOJI_OPTIONS, type AccentName } from "@streak/shared";
import { Button } from "../components/Button";
import { colors, fonts } from "../theme/tokens";
import { createTracker } from "../api";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "CreateTracker">;

export function CreateTrackerScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [accent, setAccent] = useState<AccentName>("sage");
  const [habits, setHabits] = useState<string[]>(["", "", ""]);
  const [busy, setBusy] = useState(false);

  const filled = habits.map((h) => h.trim()).filter(Boolean);
  const canCreate = !!name.trim() && filled.length >= 1 && !busy;

  const updateHabit = (i: number, v: string) =>
    setHabits((prev) => prev.map((x, j) => (j === i ? v : x)));

  const removeHabit = (i: number) =>
    setHabits((prev) => prev.filter((_, j) => j !== i));

  const addEmpty = () => setHabits((prev) => [...prev, ""]);

  const submit = async () => {
    if (!canCreate) return;
    setBusy(true);
    try {
      const created = await createTracker({
        name: name.trim(),
        emoji,
        accent,
        habits: filled.map((n) => ({ name: n })),
      });
      navigation.replace("Tracker", { id: created.id });
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={{
          flexDirection: "row", justifyContent: "space-between", alignItems: "center",
          paddingHorizontal: 16, paddingVertical: 12,
          borderBottomWidth: 1, borderBottomColor: colors.line,
        }}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.inkSoft, fontSize: 13 }}>Cancel</Text>
          </Pressable>
          <Text style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.ink }}>
            New tracker
          </Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={{
            fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1.2,
            color: colors.inkMute, textTransform: "uppercase",
          }}>
            What will you keep?
          </Text>
          <Text style={{ color: colors.inkSoft, marginTop: 4, marginBottom: 16, fontSize: 14 }}>
            A small group of habits to check off each day.
          </Text>

          <Label>Name</Label>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Morning Routine"
            placeholderTextColor={colors.inkMute}
            style={fieldStyle}
          />

          <Label>Emoji</Label>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {EMOJI_OPTIONS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEmoji(e)}
                style={{
                  width: 40, height: 40, alignItems: "center", justifyContent: "center",
                  borderRadius: 8, borderWidth: 1,
                  borderColor: emoji === e ? colors.ink : colors.line,
                  backgroundColor: emoji === e ? colors.ink : colors.paper,
                }}
              >
                <Text style={{
                  color: emoji === e ? colors.paper : colors.ink, fontSize: 18,
                }}>{e}</Text>
              </Pressable>
            ))}
          </View>

          <Label>Accent</Label>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {ACCENT_OPTIONS.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => setAccent(a.id)}
                style={{
                  flex: 1, paddingVertical: 10,
                  alignItems: "center", borderRadius: 10, borderWidth: 1,
                  backgroundColor: accent === a.id ? a.color : colors.paper,
                  borderColor: accent === a.id ? a.color : colors.line,
                }}
              >
                <Text style={{
                  color: accent === a.id ? "#fff" : colors.ink, fontSize: 13,
                }}>{a.label}</Text>
              </Pressable>
            ))}
          </View>

          <Label>Habits ({filled.length})</Label>
          {habits.map((h, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Text style={{ fontFamily: fonts.mono, color: colors.inkMute, width: 24 }}>
                {String(i + 1).padStart(2, "0")}
              </Text>
              <TextInput
                value={h}
                onChangeText={(v) => updateHabit(i, v)}
                placeholder="e.g. Read 10 pages"
                placeholderTextColor={colors.inkMute}
                style={[fieldStyle, { flex: 1, marginBottom: 0 }]}
              />
              <Pressable onPress={() => removeHabit(i)}>
                <Text style={{ color: colors.inkMute, fontSize: 18, paddingHorizontal: 6 }}>×</Text>
              </Pressable>
            </View>
          ))}

          <Pressable onPress={addEmpty} style={{ marginTop: 4, marginBottom: 22 }}>
            <Text style={{ color: colors.inkSoft, fontSize: 13 }}>+ Add another habit</Text>
          </Pressable>

          <Button
            kind="primary"
            title={busy ? "Creating…" : "Create tracker"}
            onPress={submit}
            disabled={!canCreate}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{
      fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1, color: colors.inkMute,
      textTransform: "uppercase", marginTop: 16, marginBottom: 6,
    }}>{children}</Text>
  );
}

const fieldStyle = {
  backgroundColor: colors.paper,
  borderColor: colors.line,
  borderWidth: 1,
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 15,
  color: colors.ink,
  marginBottom: 4,
} as const;
