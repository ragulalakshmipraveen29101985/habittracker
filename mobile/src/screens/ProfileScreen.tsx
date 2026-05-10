import { useState } from "react";
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "../components/Button";
import { colors, fonts } from "../theme/tokens";
import { useAuth } from "../state/AuthContext";
import { updateProfile } from "../api";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export function ProfileScreen({ navigation }: Props) {
  const { user, setUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!firstName.trim()) { setErr("First name is required"); return; }
    if (!lastName.trim())  { setErr("Last name is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErr("Enter a valid email address");
      return;
    }
    setBusy(true);
    try {
      const { user: updated } = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });
      await setUser(updated);
      navigation.goBack();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save");
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
          <Text style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.ink }}>Profile</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={{
            fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1.2,
            color: colors.inkMute, textTransform: "uppercase",
          }}>YOUR PROFILE</Text>
          <Text style={{ fontFamily: fonts.serif, fontSize: 28, marginTop: 6, marginBottom: 6, color: colors.ink }}>
            Edit your details.
          </Text>
          <Text style={{ color: colors.inkSoft, marginBottom: 18, fontSize: 14 }}>
            Change your name or email.
          </Text>

          <Label>Email (read-only)</Label>
          <View style={[fieldStyle, { backgroundColor: colors.cream2 }]}>
            <Text style={{ color: colors.inkMute, fontFamily: fonts.mono, fontSize: 14 }}>
              {user?.email ?? "—"}
            </Text>
          </View>

          <Label>First name</Label>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="e.g. Praveen"
            placeholderTextColor={colors.inkMute}
            autoCapitalize="words"
            style={fieldStyle}
          />

          <Label>Last name</Label>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="e.g. Ragula"
            placeholderTextColor={colors.inkMute}
            autoCapitalize="words"
            style={fieldStyle}
          />

          <Label>Email</Label>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.inkMute}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={fieldStyle}
          />

          {err && <Text style={{ color: colors.coral, fontSize: 13, marginTop: 12 }}>{err}</Text>}

          <View style={{ marginTop: 22 }}>
            <Button
              kind="primary"
              title={busy ? "Saving…" : "Save"}
              onPress={submit}
              disabled={busy}
            />
          </View>
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
} as const;
